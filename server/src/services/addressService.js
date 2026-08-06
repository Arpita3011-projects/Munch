const Address = require('../models/Address');

/**
 * Business logic for customer saved addresses.
 *
 * Guarantees:
 *  - Every address belongs to exactly one user (the authenticated user).
 *  - Only the owner can view / edit / delete an address (ownership checks).
 *  - At most one address per user is `isDefault`. When an address is created
 *    or updated to be default, any previous default is automatically unset.
 */
class AddressService {
  /**
   * List all addresses for a user, default first then newest first.
   */
  async getAddresses(userId) {
    const addresses = await Address.find({ user: userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    return addresses;
  }

  /**
   * Get a single address by id, with ownership validation.
   */
  async getAddressById(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      error.code = 'ADDRESS_NOT_FOUND';
      throw error;
    }
    return address;
  }

  /**
   * Create a new address for the user.
   * If `isDefault` is true (or this is the user's first address),
   * any existing default is unset first.
   */
  async createAddress(userId, data) {
    const { isDefault = false } = data;

    // First address for a user automatically becomes the default.
    const addressCount = await Address.countDocuments({ user: userId });

    if (isDefault || addressCount === 0) {
      // Unset any previous default (single default per user).
      await Address.updateMany(
        { user: userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      ...data,
      user: userId,
      isDefault: isDefault || addressCount === 0,
    });

    return address;
  }

  /**
   * Update an address by id, with ownership validation.
   * If the updated value sets `isDefault` to true, any previous
   * default is unset first.
   */
  async updateAddress(addressId, userId, data) {
    const address = await this.getAddressById(addressId, userId);

    // If user explicitly wants this to become default, clear other defaults.
    if (data.isDefault) {
      await Address.updateMany(
        { user: userId, isDefault: true, _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      );
    }

    // Prevent unsetting the only default — if this address is the current
    // default and the update tries to set isDefault=false, keep it default
    // when no other address is default.
    if (data.isDefault === false && address.isDefault) {
      const otherDefault = await Address.findOne({
        user: userId,
        isDefault: true,
        _id: { $ne: addressId },
      });
      if (!otherDefault) {
        // Keep this address as default (do not allow zero defaults).
        delete data.isDefault;
      }
    }

    Object.assign(address, data);
    await address.save();
    return address;
  }

  /**
   * Delete an address by id, with ownership validation.
   */
  async deleteAddress(addressId, userId) {
    const address = await this.getAddressById(addressId, userId);
    await Address.deleteOne({ _id: addressId, user: userId });

    // If the deleted address was the default and other addresses remain,
    // promote the newest remaining address to default.
    if (address.isDefault) {
      const nextDefault = await Address.findOne({ user: userId }).sort({
        createdAt: -1,
      });
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    return address;
  }

  /**
   * Set a specific address as the user's default.
   * Unsets any previous default first.
   */
  async setDefaultAddress(addressId, userId) {
    await this.getAddressById(addressId, userId);

    await Address.updateMany(
      { user: userId, isDefault: true, _id: { $ne: addressId } },
      { $set: { isDefault: false } }
    );
    await Address.updateOne(
      { _id: addressId, user: userId },
      { $set: { isDefault: true } }
    );

    return this.getAddressById(addressId, userId);
  }
}

module.exports = new AddressService();

