import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import AddressFormModal from '../components/domain/AddressFormModal';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useAddresses } from '../hooks/useAddresses';

const TYPE_LABELS = {
  home: 'Home',
  work: 'Work',
  other: 'Other',
};

const TYPE_ICON = {
  home: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75',
  work: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
  other: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z',
};

/**
 * Compute the initials shown in the avatar fallback.
 */
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Avatar component — shows the uploaded image, or a fallback with initials.
 */
function Avatar({ user, size = 'md' }) {
  const dims = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'sm' ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg';
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user?.name || 'Profile'}
        className={`${dims} rounded-full object-cover bg-brand-pink/10 border border-brand-charcoal/10`}
      />
    );
  }
  return (
    <div
      className={`${dims} rounded-full bg-brand-pink flex items-center justify-center text-white font-display font-bold`}
    >
      {getInitials(user?.name)}
    </div>
  );
}

/**
 * Edit Profile modal — name, phone, avatar (base64 data URL or URL).
 */
function EditProfileModal({ isOpen, user, saving, error, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', phone: '', avatar: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [localErrors, setLocalErrors] = useState({});
  const fileRef = useRef(null);

  // Reset the form whenever the modal opens (create or edit).
  useEffect(() => {
    if (!isOpen) return;
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    });
    setAvatarPreview(user?.avatar || null);
    setLocalErrors({});
  }, [isOpen, user]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setLocalErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLocalErrors((prev) => ({ ...prev, avatar: 'Please choose an image file.' }));
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setLocalErrors((prev) => ({ ...prev, avatar: 'Image must be under 1.5 MB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatarPreview(dataUrl);
      setField('avatar', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (
      form.phone.trim() &&
      !/^(\+91[\s-]?)?[6-9]\d{9}$/.test(form.phone.trim())
    ) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      avatar: form.avatar || null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover bg-brand-pink/10 border border-brand-charcoal/10" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-pink flex items-center justify-center text-white font-display font-bold text-2xl">
              {getInitials(form.name)}
            </div>
          )}
          <div className="flex-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              className="py-2 px-4 text-sm rounded-full"
              onClick={() => fileRef.current?.click()}
            >
              Upload Photo
            </Button>
            {avatarPreview && (
              <button
                type="button"
                onClick={() => {
                  setAvatarPreview(null);
                  setField('avatar', '');
                }}
                className="block mt-1.5 text-xs font-semibold text-error hover:underline cursor-pointer"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
        {localErrors.avatar && (
          <p className="text-sm text-error" role="alert">{localErrors.avatar}</p>
        )}

        {/* Name */}
        <Input
          label="Full Name"
          id="profile-name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. Arpit Sharma"
          error={localErrors.name}
          maxLength={100}
        />

        {/* Email (read-only) */}
        <Input
          label="Email"
          id="profile-email"
          value={user?.email || ''}
          disabled
          helpText="Email cannot be changed."
        />

        {/* Phone */}
        <Input
          label="Phone Number"
          id="profile-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value)}
          placeholder="e.g. 98765 43210"
          error={localErrors.phone}
          maxLength={15}
        />

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
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, logout, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading, error: profileError, refreshProfile, updateProfile } = useProfile();

  const {
    addresses,
    loading: addressesLoading,
    error: addressesError,
    refreshAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileModalError, setProfileModalError] = useState(null);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalError, setAddressModalError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  }, []);

  const refreshAll = useCallback(() => {
    refreshProfile();
    refreshAddresses();
  }, [refreshProfile, refreshAddresses]);

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressModalError(null);
    setAddressModalOpen(true);
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    setAddressModalError(null);
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    if (addressSaving) return;
    setAddressModalOpen(false);
    setEditingAddress(null);
    setAddressModalError(null);
  };

  const handleAddressSubmit = async (payload) => {
    setAddressSaving(true);
    setAddressModalError(null);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id, payload);
        showNotice('Address updated');
      } else {
        await createAddress(payload);
        showNotice('Address added');
      }
      setAddressModalOpen(false);
      setEditingAddress(null);
    } catch (err) {
      setAddressModalError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to save address. Please try again.'
      );
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSetDefault = async (address) => {
    setProcessingId(address._id);
    try {
      await setDefaultAddress(address._id);
      showNotice('Default address updated');
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to update default address');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (address) => {
    setProcessingId(address._id);
    try {
      await deleteAddress(address._id);
      setConfirmDelete(null);
      showNotice('Address deleted');
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to delete address');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Profile</h1>
        <Skeleton className="h-16 w-full mb-4 rounded-2xl" />
        <Skeleton className="h-24 w-full mb-4 rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Profile</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-brand-charcoal/60 mb-4">Sign in to view your profile</p>
          <Link to="/login" className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]">Sign In</Link>
        </div>
      </PageContainer>
    );
  }

  const current = profile || user;

  return (
    <PageContainer>
      <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Profile</h1>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-sm px-4 py-3 rounded-2xl mb-4 flex items-center gap-2 animate-fade-in" role="status">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column — Profile */}
        <div className="lg:col-span-5 space-y-4">
          {/* Profile card */}
          <div className="bg-white rounded-2xl p-6 shadow-warm">
            <div className="flex items-center gap-4">
              <Avatar user={current} size="lg" />
              <div className="flex-1 min-w-0">
                {profileLoading ? (
                  <Skeleton className="h-5 w-32 mb-2" />
                ) : (
                  <p className="font-display font-semibold text-brand-charcoal truncate">{current.name}</p>
                )}
                <p className="text-sm text-brand-charcoal/50 truncate">{current.email}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-charcoal/5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-5 h-5 text-brand-charcoal/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </span>
                <span className="text-brand-charcoal/70">{current.phone || 'No phone added'}</span>
              </div>
              <Button variant="outline" className="w-full py-2.5 rounded-full text-sm" onClick={() => { setProfileModalError(null); setEditProfileOpen(true); }}>
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <Link to="/orders" className="block bg-white rounded-2xl p-5 shadow-warm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display font-semibold text-brand-charcoal text-sm">Order History</h2>
                  <p className="text-xs text-brand-charcoal/50">View your past orders</p>
                </div>
                <svg className="w-5 h-5 ml-auto text-brand-charcoal/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
            <Link to="/favorites" className="block bg-white rounded-2xl p-5 shadow-warm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display font-semibold text-brand-charcoal text-sm">My Favourites</h2>
                  <p className="text-xs text-brand-charcoal/50">View your saved items</p>
                </div>
                <svg className="w-5 h-5 ml-auto text-brand-charcoal/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
            <Button variant="secondary" className="w-full py-2.5" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Right column — Saved Addresses */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-brand-charcoal">Saved Addresses</h2>
            <Button onClick={openAddAddress} className="px-4 py-2 text-sm rounded-full flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Address
            </Button>
          </div>

          {addressesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-warm border border-brand-cream-2 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : addressesError ? (
            <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl mb-4 flex items-center gap-2" role="alert">
              <span className="font-medium">{addressesError}</span>
              <button onClick={refreshAll} className="ml-auto text-xs font-semibold underline cursor-pointer">Retry</button>
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl shadow-warm border border-brand-cream-2 px-6">
              <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold text-brand-charcoal mb-2">No saved addresses</h3>
              <p className="text-sm text-brand-charcoal/50 mb-6 max-w-sm">Add your first delivery address to speed up checkout.</p>
              <Button onClick={openAddAddress} className="rounded-full px-8">+ Add Address</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => {
                const typeLabel = TYPE_LABELS[address.type] || 'Other';
                const typeIcon = TYPE_ICON[address.type] || TYPE_ICON.other;
                const processing = processingId === address._id;
                return (
                  <div key={address._id} className="bg-white rounded-2xl shadow-warm border border-brand-cream-2 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon} />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-brand-charcoal text-sm truncate">{address.fullName}</p>
                          <p className="text-xs text-brand-charcoal/50 tabular-nums">{address.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-charcoal/5 text-brand-charcoal/60">
                          {typeLabel}
                        </span>
                        {address.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Default
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-brand-charcoal/70 leading-relaxed space-y-0.5 mt-3">
                      <p>{address.house}, {address.street}</p>
                      {address.landmark && <p className="text-brand-charcoal/50 text-xs">Landmark: {address.landmark}</p>}
                      <p className="text-brand-charcoal/60">
                        {address.city}, {address.state} — {address.pincode}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-brand-charcoal/5 mt-3">
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(address)}
                          disabled={processing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-brand-charcoal/10 text-brand-charcoal/60 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditAddress(address)}
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-brand-charcoal/10 text-brand-charcoal/60 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(address)}
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-error/20 text-error hover:bg-error/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile modal */}
      <EditProfileModal
        isOpen={editProfileOpen}
        user={current}
        saving={profileSaving}
        error={profileModalError}
        onClose={() => { if (!profileSaving) setEditProfileOpen(false); }}
        onSubmit={async (payload) => {
          setProfileSaving(true);
          setProfileModalError(null);
          try {
            await updateProfile(payload);
            setEditProfileOpen(false);
            showNotice('Profile updated');
          } catch (err) {
            setProfileModalError(
              err.response?.data?.message ||
              err.response?.data?.errors?.[0]?.message ||
              'Failed to update profile. Please try again.'
            );
          } finally {
            setProfileSaving(false);
          }
        }}
      />

      {/* Add / Edit address modal */}
      <AddressFormModal
        isOpen={addressModalOpen}
        address={editingAddress}
        saving={addressSaving}
        error={addressModalError}
        onClose={closeAddressModal}
        onSubmit={handleAddressSubmit}
      />

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Address?"
      >
        <div className="space-y-5">
          <p className="text-sm text-brand-charcoal/70">
            Are you sure you want to delete this address?
            {confirmDelete?.isDefault && ' This is your default address.'}
          </p>
          {confirmDelete && (
            <div className="bg-brand-cream-2/40 rounded-2xl p-4 text-sm text-brand-charcoal/70">
              <p className="font-semibold text-brand-charcoal">{confirmDelete.fullName}</p>
              <p>{confirmDelete.house}, {confirmDelete.street}</p>
              <p>{confirmDelete.city}, {confirmDelete.state} — {confirmDelete.pincode}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 py-3 rounded-full text-sm font-semibold"
              onClick={() => setConfirmDelete(null)}
              disabled={processingId === confirmDelete?._id}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1 py-3 rounded-full text-sm font-semibold bg-error hover:bg-error/90"
              loading={processingId === confirmDelete?._id}
              onClick={() => handleDelete(confirmDelete)}
              disabled={processingId === confirmDelete?._id}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
