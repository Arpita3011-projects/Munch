import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { useAuth } from './useAuth';

/**
 * Hook that manages a user's saved addresses as a single source of truth.
 *
 * Exposes:
 * - addresses         : Address[] — saved addresses (default first)
 * - loading           : boolean
 * - error             : string | null
 * - refreshAddresses  : () => void — refetch from server
 * - createAddress     : (data) => Promise<Address>
 * - updateAddress     : (id, data) => Promise<Address>
 * - deleteAddress     : (id) => Promise<Address>
 * - setDefaultAddress : (id) => Promise<Address>
 * - getDefaultAddress : () => Address | undefined
 */
export function useAddresses() {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/addresses');
      setAddresses(res.data.data.addresses);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  const createAddress = useCallback(async (data) => {
    const res = await api.post('/addresses', data);
    const created = res.data.data.address;
    // Refresh so the default-first ordering stays in sync.
    await refreshAddresses();
    return created;
  }, [refreshAddresses]);

  const updateAddress = useCallback(async (id, data) => {
    const res = await api.put(`/addresses/${id}`, data);
    const updated = res.data.data.address;
    await refreshAddresses();
    return updated;
  }, [refreshAddresses]);

  const deleteAddress = useCallback(async (id) => {
    const res = await api.delete(`/addresses/${id}`);
    const deleted = res.data.data.address;
    await refreshAddresses();
    return deleted;
  }, [refreshAddresses]);

  const setDefaultAddress = useCallback(async (id) => {
    const res = await api.put(`/addresses/${id}/default`);
    const updated = res.data.data.address;
    await refreshAddresses();
    return updated;
  }, [refreshAddresses]);

  const getDefaultAddress = useCallback(() => {
    return addresses.find((a) => a.isDefault);
  }, [addresses]);

  return {
    addresses,
    loading,
    error,
    refreshAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
  };
}

