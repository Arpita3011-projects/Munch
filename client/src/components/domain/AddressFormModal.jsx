import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ADDRESS_TYPES = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' },
];

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  house: '',
  street: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  type: 'home',
  isDefault: false,
};

/**
 * Add / Edit address modal.
 *
 * Supports:
 *  - Full address form with validation.
 *  - Address type selector (Home / Work / Other).
 *  - "Set as default" toggle.
 *  - Loading state on submit.
 *  - Server / validation error display.
 *
 * @param {boolean} isOpen - Whether the modal is visible.
 * @param {object|null} address - The address being edited, or null for "add new".
 * @param {boolean} saving - Whether a save request is in flight.
 * @param {string|null} error - Server error message to surface.
 * @param {function} onClose - Close handler.
 * @param {function} onSubmit - Called with the assembled payload.
 */
export default function AddressFormModal({ isOpen, address, saving, error, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [localErrors, setLocalErrors] = useState({});

  // Reset the form whenever the modal opens (create or edit).
  useEffect(() => {
    if (!isOpen) return;
    if (address) {
      setForm({
        fullName: address.fullName || '',
        phone: address.phone || '',
        house: address.house || '',
        street: address.street || '',
        landmark: address.landmark || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        type: address.type || 'home',
        isDefault: !!address.isDefault,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setLocalErrors({});
  }, [isOpen, address]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setLocalErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[+]?[\d\s-]{10,15}$/.test(form.phone.trim())) errors.phone = 'Enter a valid phone number';
    if (!form.house.trim()) errors.house = 'House / Flat No. is required';
    if (!form.street.trim()) errors.street = 'Street / Area is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state.trim()) errors.state = 'State is required';
    if (!form.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode';

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      house: form.house.trim(),
      street: form.street.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      type: form.type,
      isDefault: form.isDefault,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={address ? 'Edit Address' : 'Add Address'}>
      <div className="space-y-5">
        {/* Full name & phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            id="addr-full-name"
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            placeholder="e.g. Arpit Sharma"
            error={localErrors.fullName}
            maxLength={100}
          />
          <Input
            label="Phone Number"
            id="addr-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="e.g. 98765 43210"
            error={localErrors.phone}
            maxLength={15}
          />
        </div>

        {/* House & Street */}
        <Input
          label="House / Flat No."
          id="addr-house"
          value={form.house}
          onChange={(e) => setField('house', e.target.value)}
          placeholder="e.g. 4B, Royal Residency"
          error={localErrors.house}
          maxLength={100}
        />
        <Input
          label="Street / Area"
          id="addr-street"
          value={form.street}
          onChange={(e) => setField('street', e.target.value)}
          placeholder="e.g. MG Road, Indiranagar"
          error={localErrors.street}
          maxLength={200}
        />

        {/* Landmark (optional) */}
        <Input
          label="Landmark (optional)"
          id="addr-landmark"
          value={form.landmark}
          onChange={(e) => setField('landmark', e.target.value)}
          placeholder="e.g. Near City Mall"
          error={localErrors.landmark}
          maxLength={200}
        />

        {/* City & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City"
            id="addr-city"
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
            placeholder="e.g. Bengaluru"
            error={localErrors.city}
            maxLength={100}
          />
          <Input
            label="State"
            id="addr-state"
            value={form.state}
            onChange={(e) => setField('state', e.target.value)}
            placeholder="e.g. Karnataka"
            error={localErrors.state}
            maxLength={100}
          />
        </div>

        {/* Pincode */}
        <Input
          label="Pincode"
          id="addr-pincode"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={form.pincode}
          onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, ''))}
          placeholder="e.g. 560038"
          error={localErrors.pincode}
          maxLength={6}
        />

        {/* Address type */}
        <div>
          <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
            Address Type
          </label>
          <div className="flex flex-wrap gap-2">
            {ADDRESS_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setField('type', t.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                  form.type === t.value
                    ? 'bg-brand-pink text-white'
                    : 'bg-brand-charcoal/5 text-brand-charcoal/60 hover:bg-brand-charcoal/10'
                }`}
                aria-pressed={form.type === t.value}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Default toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.isDefault}
            onClick={() => setField('isDefault', !form.isDefault)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isDefault ? 'bg-success' : 'bg-brand-charcoal/20'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isDefault ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm font-medium text-brand-charcoal">
            Set as default address
          </span>
        </div>

        {/* Server error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in" role="alert">
            <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 py-3 rounded-full text-sm font-semibold"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 py-3 rounded-full text-sm font-semibold"
            loading={saving}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : address ? 'Save Changes' : 'Add Address'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

