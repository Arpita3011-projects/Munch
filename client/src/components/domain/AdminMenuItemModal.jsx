import { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const MENU_CATEGORIES = ['Milkshakes', 'Sundaes', 'Ice Cream', 'Cookie Dough', 'Coffee'];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  isAvailable: true,
  tags: [],
  sizes: [],
  addOns: [],
};

/**
 * Add / Edit menu item modal for the admin menu manager.
 *
 * Supports:
 *  - Full form with validation (required fields, positive price, valid category).
 *  - Image selection: paste an image URL OR select a local file (converted to a
 *    data URL for preview, then served to the API which persists the URL/data).
 *  - Live image preview.
 *  - Loading state on submit with the button disabled while saving.
 *  - Server/validation error display.
 *
 * @param {boolean} isOpen - Whether the modal is visible.
 * @param {object|null} item - The menu item being edited, or null for "add new".
 * @param {boolean} saving - Whether a save request is in flight.
 * @param {string|null} error - Server error message to surface.
 * @param {function} onClose - Close handler.
 * @param {function} onSubmit - Called with the assembled payload.
 */
export default function AdminMenuItemModal({ isOpen, item, saving, error, onClose, onSubmit }) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [localErrors, setLocalErrors] = useState({});

  // Reset the form whenever the modal opens (either for create or edit).
  useEffect(() => {
    if (!isOpen) return;
    if (item) {
      setForm({
        name: item.name || '',
        description: item.description || '',
        price: item.price ?? '',
        category: item.category || '',
        image: item.image || '',
        isAvailable: item.isAvailable ?? true,
        tags: item.tags || [],
        sizes: item.sizes || [],
        addOns: item.addOns || [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setLocalErrors({});
  }, [isOpen, item]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setLocalErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLocalErrors((prev) => ({ ...prev, image: 'Please select an image file' }));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setLocalErrors((prev) => ({ ...prev, image: 'Image must be smaller than 4 MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setField('image', reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTagsKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const value = e.target.value.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(value) ? prev.tags : [...prev.tags, value],
    }));
    e.target.value = '';
  };

  const removeTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Item name is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      errors.price = 'Enter a valid non-negative price';
    }
    if (!form.category) errors.category = 'Select a category';
    if (!form.image.trim()) errors.image = 'Image URL or file is required';

    for (const [i, size] of form.sizes.entries()) {
      if (!size.name?.trim()) {
        errors[`size-${i}`] = `Size ${i + 1} is missing a name`;
      }
    }
    for (const [i, ao] of form.addOns.entries()) {
      if (!ao.name?.trim()) {
        errors[`addon-${i}`] = `Add-on ${i + 1} is missing a name`;
      }
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      image: form.image.trim(),
      isAvailable: form.isAvailable,
      tags: form.tags,
      sizes: form.sizes.map((s) => ({
        name: s.name,
        priceAdjustment: Number(s.priceAdjustment || 0),
      })),
      addOns: form.addOns.map((ao) => ({
        name: ao.name,
        price: Number(ao.price || 0),
      })),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Menu Item' : 'Add Menu Item'}>
      <div className="space-y-5">
        {/* Name */}
        <Input
          label="Item Name"
          id="admin-item-name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. Classic Vanilla Milkshake"
          error={localErrors.name}
          maxLength={100}
        />

        {/* Description */}
        <div>
          <label htmlFor="admin-item-description" className="block text-sm font-medium text-brand-charcoal mb-1.5">
            Description
          </label>
          <textarea
            id="admin-item-description"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Describe the item..."
            maxLength={500}
            rows={3}
            className={`block w-full px-4 py-3 bg-white border-2 rounded-2xl text-brand-charcoal placeholder:text-brand-charcoal/40 transition-all duration-150 focus:border-brand-pink focus:ring-brand-pink ${localErrors.description ? 'border-error' : 'border-brand-charcoal/10'}`}
          />
          {localErrors.description && (
            <p className="mt-1.5 text-sm text-error" role="alert">{localErrors.description}</p>
          )}
        </div>

        {/* Price & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Price"
            id="admin-item-price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setField('price', e.target.value)}
            placeholder="0.00"
            error={localErrors.price}
          />
          <div>
            <label htmlFor="admin-item-category" className="block text-sm font-medium text-brand-charcoal mb-1.5">
              Category
            </label>
            <select
              id="admin-item-category"
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
              className={`block w-full px-4 py-3 bg-white border-2 rounded-2xl text-brand-charcoal transition-all duration-150 focus:border-brand-pink focus:ring-brand-pink ${localErrors.category ? 'border-error' : 'border-brand-charcoal/10'}`}
            >
              <option value="">Select category</option>
              {MENU_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {localErrors.category && (
              <p className="mt-1.5 text-sm text-error" role="alert">{localErrors.category}</p>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.isAvailable}
            onClick={() => setField('isAvailable', !form.isAvailable)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isAvailable ? 'bg-success' : 'bg-brand-charcoal/20'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm font-medium text-brand-charcoal">
            {form.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
            Image
          </label>
          <div className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${localErrors.image ? 'border-error' : 'border-brand-charcoal/15'}`}>
            {/* Preview */}
            {form.image ? (
              <div className="relative mb-3">
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-36 object-cover rounded-xl border border-brand-cream-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-36 rounded-xl bg-brand-cream-2 items-center justify-center text-brand-charcoal/40 text-sm">
                  Preview unavailable
                </div>
                <button
                  type="button"
                  onClick={() => setField('image', '')}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-brand-charcoal/70 text-white flex items-center justify-center hover:bg-brand-charcoal transition-colors"
                  aria-label="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-brand-charcoal/30 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21zM10.5 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="admin-item-image-url"
                value={form.image.startsWith('data:') ? '' : form.image}
                onChange={(e) => setField('image', e.target.value)}
                placeholder="Paste an image URL"
                helpText={form.image.startsWith('data:') ? 'Using a file you selected' : undefined}
              />
              <Button
                type="button"
                variant="outline"
                className="sm:w-auto whitespace-nowrap"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFile}
              />
            </div>
          </div>
          {localErrors.image && (
            <p className="mt-1.5 text-sm text-error" role="alert">{localErrors.image}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="admin-item-tags" className="block text-sm font-medium text-brand-charcoal mb-1.5">
            Tags
          </label>
          <Input
            id="admin-item-tags"
            placeholder="Type a tag and press Enter"
            onKeyDown={handleTagsKeyDown}
            helpText="Press Enter to add a tag"
          />
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-charcoal/70 bg-brand-charcoal/5 px-2.5 py-1 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-brand-charcoal/40 hover:text-error transition-colors"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sizes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-brand-charcoal">Sizes</label>
            <Button
              type="button"
              variant="outline"
              className="px-3 py-1.5 text-xs rounded-full"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  sizes: [...prev.sizes, { name: '', priceAdjustment: 0 }],
                }))
              }
            >
              + Add size
            </Button>
          </div>
          {form.sizes.length === 0 ? (
            <p className="text-xs text-brand-charcoal/40 italic">No sizes — defaults to "Regular".</p>
          ) : (
            <div className="space-y-2">
              {form.sizes.map((size, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Size name"
                    value={size.name}
                    onChange={(e) => {
                      const next = [...form.sizes];
                      next[i] = { ...next[i], name: e.target.value };
                      setForm((prev) => ({ ...prev, sizes: next }));
                    }}
                    className="flex-1 px-3 py-2 text-sm"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="₹ adj."
                    value={size.priceAdjustment ?? ''}
                    onChange={(e) => {
                      const next = [...form.sizes];
                      next[i] = { ...next[i], priceAdjustment: e.target.value };
                      setForm((prev) => ({ ...prev, sizes: next }));
                    }}
                    className="w-24 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((_, idx) => idx !== i) }))}
                    className="p-2 rounded-full text-brand-charcoal/30 hover:text-error hover:bg-error/5 transition-colors"
                    aria-label="Remove size"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          {localErrors['size-0'] && (
            <p className="mt-1.5 text-sm text-error" role="alert">{localErrors['size-0']}</p>
          )}
        </div>

        {/* Add-ons */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-brand-charcoal">Add-ons</label>
            <Button
              type="button"
              variant="outline"
              className="px-3 py-1.5 text-xs rounded-full"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  addOns: [...prev.addOns, { name: '', price: 0 }],
                }))
              }
            >
              + Add add-on
            </Button>
          </div>
          {form.addOns.length === 0 ? (
            <p className="text-xs text-brand-charcoal/40 italic">No add-ons.</p>
          ) : (
            <div className="space-y-2">
              {form.addOns.map((ao, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Add-on name"
                    value={ao.name}
                    onChange={(e) => {
                      const next = [...form.addOns];
                      next[i] = { ...next[i], name: e.target.value };
                      setForm((prev) => ({ ...prev, addOns: next }));
                    }}
                    className="flex-1 px-3 py-2 text-sm"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="₹ price"
                    value={ao.price ?? ''}
                    onChange={(e) => {
                      const next = [...form.addOns];
                      next[i] = { ...next[i], price: e.target.value };
                      setForm((prev) => ({ ...prev, addOns: next }));
                    }}
                    className="w-24 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, addOns: prev.addOns.filter((_, idx) => idx !== i) }))}
                    className="p-2 rounded-full text-brand-charcoal/30 hover:text-error hover:bg-error/5 transition-colors"
                    aria-label="Remove add-on"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
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
            {saving ? 'Saving...' : item ? 'Save Changes' : 'Create Item'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

