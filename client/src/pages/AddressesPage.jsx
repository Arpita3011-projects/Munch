import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import AddressFormModal from '../components/domain/AddressFormModal';
import { useAddresses } from '../hooks/useAddresses';
import { useAuth } from '../hooks/useAuth';

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

function AddressCard({ address, onEdit, onDelete, onSetDefault, processing }) {
  const typeLabel = TYPE_LABELS[address.type] || 'Other';
  const typeIcon = TYPE_ICON[address.type] || TYPE_ICON.other;

  return (
    <div className="bg-white rounded-2xl shadow-warm border border-brand-cream-2 p-5 flex flex-col gap-4 transition-shadow hover:shadow-md">
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

      <div className="text-sm text-brand-charcoal/70 leading-relaxed space-y-0.5">
        <p>{address.house}, {address.street}</p>
        {address.landmark && <p className="text-brand-charcoal/50 text-xs">Landmark: {address.landmark}</p>}
        <p className="text-brand-charcoal/60">
          {address.city}, {address.state} — {address.pincode}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-brand-charcoal/5 mt-auto">
        {!address.isDefault && (
          <button
            type="button"
            onClick={onSetDefault}
            disabled={processing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-brand-charcoal/10 text-brand-charcoal/60 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Set Default
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
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
          onClick={onDelete}
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
}

function AddressCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-warm border border-brand-cream-2 p-5 space-y-4">
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
        <Skeleton className="h-3.5 w-1/2" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

export default function AddressesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    addresses,
    loading,
    error: loadError,
    refreshAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  }, []);

  const openAdd = () => {
    setEditing(null);
    setModalError(null);
    setModalOpen(true);
  };

  const openEdit = (address) => {
    setEditing(address);
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setModalError(null);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    setModalError(null);
    try {
      if (editing) {
        await updateAddress(editing._id, payload);
        showNotice('Address updated');
      } else {
        await createAddress(payload);
        showNotice('Address added');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      setModalError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to save address. Please try again.'
      );
    } finally {
      setSaving(false);
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

  if (!isAuthenticated) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Saved Addresses</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-brand-charcoal/60 mb-4">Please sign in to manage your saved addresses.</p>
          <Button onClick={() => navigate('/login', { state: { from: '/addresses' } })}>
            Sign In
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-display font-bold text-brand-charcoal">Saved Addresses</h1>
        <Button onClick={openAdd} className="flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Address
        </Button>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-sm px-4 py-3 rounded-2xl mb-4 flex items-center gap-2 animate-fade-in" role="status">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{notice}</span>
        </div>
      )}

      {loadError && (
        <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl mb-4 flex items-center gap-2" role="alert">
          <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{loadError}</span>
          <button onClick={refreshAddresses} className="ml-auto text-xs font-semibold underline cursor-pointer">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <AddressCardSkeleton key={i} />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl shadow-warm border border-brand-cream-2 px-6">
          <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-brand-charcoal mb-2">No saved addresses</h2>
          <p className="text-sm text-brand-charcoal/50 mb-6 max-w-sm">Add your first delivery address to speed up checkout.</p>
          <Button onClick={openAdd} className="rounded-full px-8">+ Add Address</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              processing={processingId === address._id}
              onEdit={() => openEdit(address)}
              onDelete={() => setConfirmDelete(address)}
              onSetDefault={() => handleSetDefault(address)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <AddressFormModal
        isOpen={modalOpen}
        address={editing}
        saving={saving}
        error={modalError}
        onClose={closeModal}
        onSubmit={handleSubmit}
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

