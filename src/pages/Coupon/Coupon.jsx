import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, IconButton, Checkbox, Select, Option } from '@material-tailwind/react';
import { getCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon } from '../../services/api';
import { getCompanies } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export default function Coupon() {
  const { settings } = useSettings();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = settings.itemsPerPage;
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [formData, setFormData] = useState({
    companyId: '',
    code: '',
    type: 'percentage',
    amount: '',
    usageLimit: '',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchCoupons();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await getCompanies();
      const companiesList = response?.data?.data || response?.data || response || [];
      setAvailableCompanies(Array.isArray(companiesList) ? companiesList : []);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setProcessing(true);
      setError('');
      
      console.log('Fetching coupons...');
      const response = await getCoupons();
      console.log('Response received:', response);
      
      let couponsList = [];
      
      if (Array.isArray(response)) {
        couponsList = response;
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          couponsList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          couponsList = response.data.data;
        } else if (response.data.coupons && Array.isArray(response.data.coupons)) {
          couponsList = response.data.coupons;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          couponsList = response.data.items;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          couponsList = response.data.results;
        }
      } else if (response.coupons && Array.isArray(response.coupons)) {
        couponsList = response.coupons;
      } else if (response.items && Array.isArray(response.items)) {
        couponsList = response.items;
      } else if (response.results && Array.isArray(response.results)) {
        couponsList = response.results;
      }
      
      console.log('Processed coupons:', couponsList.length, 'coupons');
      
      if (couponsList.length > 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setCoupons(couponsList);
      
      if (couponsList.length === 0) {
        console.warn('No coupons found in response. Full response:', response);
        setError('No coupons found.');
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError(err.message || 'Failed to load coupons. Please check the console for details.');
      setCoupons([]);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleOpenDetails = async (coupon) => {
    try {
      setError('');
      const couponDetails = await getCouponById(coupon.id);
      const couponData = couponDetails?.data?.data || couponDetails?.data || couponDetails || coupon;
      setSelectedCoupon(couponData);
      setOpenDetailsDialog(true);
    } catch (err) {
      setError(err.message || 'Failed to load coupon details');
      setSelectedCoupon(coupon);
      setOpenDetailsDialog(true);
    }
  };

  const handleOpenDialog = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        companyId: coupon.companyId?.toString() || coupon.company?.id?.toString() || '',
        code: coupon.code || '',
        type: coupon.type || 'percentage',
        amount: coupon.amount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
        startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
        endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        companyId: '',
        code: '',
        type: 'percentage',
        amount: '',
        usageLimit: '',
        isActive: true,
        startDate: '',
        endDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCoupon(null);
    setFormData({
      companyId: '',
      code: '',
      type: 'percentage',
      amount: '',
      usageLimit: '',
      isActive: true,
      startDate: '',
      endDate: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      const couponData = {
        companyId: parseInt(formData.companyId),
        code: formData.code,
        type: formData.type,
        amount: parseFloat(formData.amount),
      };

      if (formData.usageLimit) {
        couponData.usageLimit = parseInt(formData.usageLimit);
      }
      if (formData.isActive !== undefined) {
        couponData.isActive = formData.isActive;
      }
      if (formData.startDate) {
        couponData.startDate = formData.startDate;
      }
      if (formData.endDate) {
        couponData.endDate = formData.endDate;
      }

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData);
      } else {
        await createCoupon(couponData);
      }
      
      handleCloseDialog();
      fetchCoupons();
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      await deleteCoupon(deleteId);
      const wasLastItemOnPage = paginatedCoupons.length === 1;
      const wasNotFirstPage = currentPage > 1;
      setOpenDeleteDialog(false);
      setDeleteId(null);
      await fetchCoupons();
      if (wasLastItemOnPage && wasNotFirstPage) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete coupon');
      setOpenDeleteDialog(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Pagination calculations
  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCoupons = coupons.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatAmount = (amount, type) => {
    if (type === 'percentage') {
      return `${amount}%`;
    }
    return `${amount.toLocaleString()} UZS`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading coupons...</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
            <div>
              <Typography variant="h3" color="blue-gray" className="text-2xl font-bold">
                Coupons
              </Typography>
              {coupons.length > 0 && (
                <Typography variant="small" color="gray" className="mt-1">
                  {coupons.length} {coupons.length === 1 ? 'coupon' : 'coupons'} found
                </Typography>
              )}
            </div>
            <Button onClick={() => handleOpenDialog()} color="blue" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Coupon
            </Button>
          </div>

          {processing && !loading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400"></div>
              <span>Processing coupon data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              <div className="font-semibold mb-1">Error loading coupons</div>
              <div className="text-sm">{error}</div>
              <Button 
                size="sm" 
                color="red" 
                variant="outlined" 
                className="mt-2"
                onClick={fetchCoupons}>
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Table Section */}
        {coupons.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Typography variant="h6" color="gray" className="mb-2">
                No coupons found
              </Typography>
              <Typography variant="small" color="gray" className="mb-4">
                Get started by creating your first coupon
              </Typography>
              <Button onClick={() => handleOpenDialog()} color="blue">
                Add Coupon
              </Button>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-transparent border-b border-stone-200 bg-gradient-to-br from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700"></th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Company</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCoupons.map((coupon) => (
                    <React.Fragment key={coupon.id}>
                      <tr className="border-b border-stone-200 hover:bg-stone-50 transition">
                        <td className="px-6 py-4">
                          <IconButton
                            variant="text"
                            onClick={() => toggleRowExpand(coupon.id)}
                            size="sm"
                            className="text-stone-500 hover:text-stone-700">
                            {expandedRows[coupon.id] ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                              </svg>
                            )}
                          </IconButton>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {coupon.code || 'N/A'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="gray">
                            {coupon.company?.name || (coupon.companyId ? `Company ID: ${coupon.companyId}` : 'N/A')}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                            {coupon.type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {coupon.amount ? formatAmount(coupon.amount, coupon.type) : 'N/A'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            coupon.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <IconButton
                              variant="text"
                              color="blue"
                              onClick={() => handleOpenDetails(coupon)}
                              size="sm"
                              title="View Details">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </IconButton>
                            <IconButton
                              variant="text"
                              color="gray"
                              onClick={() => handleOpenDialog(coupon)}
                              size="sm"
                              title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </IconButton>
                            <IconButton
                              variant="text"
                              color="red"
                              onClick={() => handleDeleteClick(coupon.id)}
                              size="sm"
                              title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                      {expandedRows[coupon.id] && (
                        <tr className="bg-stone-50 border-b border-stone-200">
                          <td colSpan="7" className="px-6 py-4">
                            <div 
                              className="grid grid-cols-1 md:grid-cols-2 gap-6"
                              style={{
                                animation: 'slideDown 0.3s ease-out',
                              }}
                            >
                              {/* Left Column - Basic Information */}
                              <Card className="shadow-sm">
                                <CardBody className="p-4">
                                  <Typography variant="h6" color="blue-gray" className="mb-4 font-semibold">
                                    Basic Information
                                  </Typography>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Code:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {coupon.code || 'N/A'}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Type:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold capitalize">
                                        {coupon.type || 'N/A'}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Amount:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {coupon.amount ? formatAmount(coupon.amount, coupon.type) : 'N/A'}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Status:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                      </Typography>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>

                              {/* Right Column - Additional Details */}
                              <Card className="shadow-sm">
                                <CardBody className="p-4">
                                  <Typography variant="h6" color="blue-gray" className="mb-4 font-semibold">
                                    Additional Details
                                  </Typography>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Company:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {coupon.company?.name || (coupon.companyId ? `ID: ${coupon.companyId}` : 'N/A')}
                                      </Typography>
                                    </div>
                                    {coupon.usageLimit && (
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Usage Limit:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {coupon.usageLimit}
                                        </Typography>
                                      </div>
                                    )}
                                    {coupon.startDate && (
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Start Date:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {new Date(coupon.startDate).toLocaleDateString()}
                                        </Typography>
                                      </div>
                                    )}
                                    {coupon.endDate && (
                                      <div className="flex justify-between items-center">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          End Date:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {new Date(coupon.endDate).toLocaleDateString()}
                                        </Typography>
                                      </div>
                                    )}
                                  </div>
                                </CardBody>
                              </Card>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outlined"
                  color="blue"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "filled" : "outlined"}
                          color="blue"
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="min-w-[40px]">
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outlined"
                  color="blue"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1">
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            )}

            {/* Page Info */}
            {coupons.length > 0 && (
              <div className="text-center mt-4 pb-4">
                <Typography variant="small" color="gray">
                  Showing {startIndex + 1} to {Math.min(endIndex, coupons.length)} of {coupons.length} coupons
                </Typography>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        handler={handleCloseDialog} 
        size="lg"
        className="max-h-[90vh]"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <Typography variant="h4" color="blue-gray">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </Typography>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody divider className="space-y-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Basic Information</h3>
              <Select
                label="Company"
                value={formData.companyId}
                onChange={(val) => setFormData({ ...formData, companyId: val })}
                required>
                {availableCompanies.map((company) => (
                  <Option key={company.id} value={company.id.toString()}>
                    {company.name}
                  </Option>
                ))}
              </Select>
              <Input
                label="Coupon Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                placeholder="e.g., ABC123"
              />
              <Select
                label="Type"
                value={formData.type}
                onChange={(val) => setFormData({ ...formData, type: val })}
                required>
                <Option value="percentage">Percentage</Option>
                <Option value="fixed">Fixed Amount</Option>
              </Select>
              <Input
                type="number"
                label={formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (UZS)'}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                min="0"
                step={formData.type === 'percentage' ? '1' : '0.01'}
                placeholder={formData.type === 'percentage' ? 'e.g., 10' : 'e.g., 10000'}
              />
            </div>

            {/* Additional Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Additional Settings</h3>
              <Input
                type="number"
                label="Usage Limit"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                min="1"
                placeholder="Optional: Maximum number of uses"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <Input
                  type="date"
                  label="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <Checkbox
                id="isActive"
                label="Is Active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </div>
          </DialogBody>
          <DialogFooter className="border-t border-gray-200 pt-4">
            <Button
              variant="text"
              color="red"
              onClick={handleCloseDialog}
              className="mr-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="blue"
              variant="gradient"
            >
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        handler={() => setOpenDeleteDialog(false)} 
        size="sm"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <Typography variant="h5" color="red">
            Delete Coupon
          </Typography>
        </DialogHeader>
        <DialogBody divider>
          <Typography>
            Are you sure you want to delete this coupon? This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter className="border-t border-gray-200 pt-4">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenDeleteDialog(false)}
            className="mr-1">
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="red" 
            onClick={handleDelete}
          >
            Delete Coupon
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Coupon Details Dialog */}
      <Dialog 
        open={openDetailsDialog} 
        handler={() => setOpenDetailsDialog(false)} 
        size="lg"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <Typography variant="h4" color="blue-gray">
            Coupon Details
          </Typography>
        </DialogHeader>
        <DialogBody divider className="max-h-[70vh] overflow-y-auto">
          {selectedCoupon ? (
            <div className="space-y-6">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Basic Information
                </Typography>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Code:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedCoupon.code || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Type:
                    </Typography>
                    <Typography variant="small" color="blue-gray" className="capitalize">
                      {selectedCoupon.type || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Amount:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedCoupon.amount ? formatAmount(selectedCoupon.amount, selectedCoupon.type) : 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Status:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedCoupon.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                  </div>
                </div>
              </div>

              <div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Additional Details
                </Typography>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Company:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedCoupon.company?.name || (selectedCoupon.companyId ? `ID: ${selectedCoupon.companyId}` : 'N/A')}
                    </Typography>
                  </div>
                  {selectedCoupon.usageLimit && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Usage Limit:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {selectedCoupon.usageLimit}
                      </Typography>
                    </div>
                  )}
                  {selectedCoupon.startDate && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Start Date:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {new Date(selectedCoupon.startDate).toLocaleString()}
                      </Typography>
                    </div>
                  )}
                  {selectedCoupon.endDate && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        End Date:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {new Date(selectedCoupon.endDate).toLocaleString()}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Typography variant="small" color="gray">
                No coupon selected
              </Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="border-t border-gray-200 pt-4">
          <Button
            variant="gradient"
            color="blue"
            onClick={() => setOpenDetailsDialog(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

