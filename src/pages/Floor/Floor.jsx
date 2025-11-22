import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, IconButton, Select, Option } from '@material-tailwind/react';
import { getFloors, getFloorById, createFloor, updateFloor, deleteFloor, getFloorsByCompany } from '../../services/api';
import { getCompanies } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export default function Floor() {
  const { settings } = useSettings();
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = settings.itemsPerPage;
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [filterCompanyId, setFilterCompanyId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    locationId: '',
  });

  useEffect(() => {
    fetchFloors();
    fetchCompanies();
  }, [filterCompanyId]);

  const fetchCompanies = async () => {
    try {
      const response = await getCompanies();
      const companiesList = response?.data?.data || response?.data || response || [];
      setAvailableCompanies(Array.isArray(companiesList) ? companiesList : []);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchFloors = async () => {
    try {
      setLoading(true);
      setProcessing(true);
      setError('');
      
      console.log('Fetching floors...');
      let response;
      
      if (filterCompanyId) {
        response = await getFloorsByCompany(filterCompanyId);
      } else {
        response = await getFloors();
      }
      
      console.log('Response received:', response);
      
      let floorsList = [];
      
      if (Array.isArray(response)) {
        floorsList = response;
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          floorsList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          floorsList = response.data.data;
        } else if (response.data.floors && Array.isArray(response.data.floors)) {
          floorsList = response.data.floors;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          floorsList = response.data.items;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          floorsList = response.data.results;
        }
      } else if (response.floors && Array.isArray(response.floors)) {
        floorsList = response.floors;
      } else if (response.items && Array.isArray(response.items)) {
        floorsList = response.items;
      } else if (response.results && Array.isArray(response.results)) {
        floorsList = response.results;
      }
      
      console.log('Processed floors:', floorsList.length, 'floors');
      
      if (floorsList.length > 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setFloors(floorsList);
      
      if (floorsList.length === 0) {
        console.warn('No floors found in response. Full response:', response);
        setError('No floors found.');
      }
    } catch (err) {
      console.error('Error fetching floors:', err);
      setError(err.message || 'Failed to load floors. Please check the console for details.');
      setFloors([]);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleOpenDetails = async (floor) => {
    try {
      setError('');
      const floorDetails = await getFloorById(floor.id);
      const floorData = floorDetails?.data?.data || floorDetails?.data || floorDetails || floor;
      setSelectedFloor(floorData);
      setOpenDetailsDialog(true);
    } catch (err) {
      setError(err.message || 'Failed to load floor details');
      setSelectedFloor(floor);
      setOpenDetailsDialog(true);
    }
  };

  const handleOpenDialog = (floor = null) => {
    if (floor) {
      setEditingFloor(floor);
      setFormData({
        name: floor.name || '',
        locationId: floor.locationId?.toString() || floor.location?.id?.toString() || '',
      });
    } else {
      setEditingFloor(null);
      setFormData({
        name: '',
        locationId: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFloor(null);
    setFormData({
      name: '',
      locationId: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      const floorData = {
        name: formData.name,
        locationId: parseInt(formData.locationId),
      };

      if (editingFloor) {
        await updateFloor(editingFloor.id, floorData);
      } else {
        await createFloor(floorData);
      }
      
      handleCloseDialog();
      fetchFloors();
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to save floor');
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      await deleteFloor(deleteId);
      const wasLastItemOnPage = paginatedFloors.length === 1;
      const wasNotFirstPage = currentPage > 1;
      setOpenDeleteDialog(false);
      setDeleteId(null);
      await fetchFloors();
      if (wasLastItemOnPage && wasNotFirstPage) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete floor');
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
  const totalPages = Math.ceil(floors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFloors = floors.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading floors...</p>
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
                Floors
              </Typography>
              {floors.length > 0 && (
                <Typography variant="small" color="gray" className="mt-1">
                  {floors.length} {floors.length === 1 ? 'floor' : 'floors'} found
                </Typography>
              )}
            </div>
            <Button onClick={() => handleOpenDialog()} color="blue" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Floor
            </Button>
          </div>

          {/* Filter Section */}
          <div className="mb-4">
            <div className="flex items-center gap-4">
              <Select
                label="Filter by Company"
                value={filterCompanyId}
                onChange={(val) => {
                  setFilterCompanyId(val);
                  setCurrentPage(1);
                }}
                className="max-w-xs">
                <Option value="">All Companies</Option>
                {availableCompanies.map((company) => (
                  <Option key={company.id} value={company.id.toString()}>
                    {company.name}
                  </Option>
                ))}
              </Select>
              {filterCompanyId && (
                <Button
                  variant="outlined"
                  color="gray"
                  size="sm"
                  onClick={() => {
                    setFilterCompanyId('');
                    setCurrentPage(1);
                  }}>
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          {processing && !loading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400"></div>
              <span>Processing floor data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              <div className="font-semibold mb-1">Error loading floors</div>
              <div className="text-sm">{error}</div>
              <Button 
                size="sm" 
                color="red" 
                variant="outlined" 
                className="mt-2"
                onClick={fetchFloors}>
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Table Section */}
        {floors.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Typography variant="h6" color="gray" className="mb-2">
                No floors found
              </Typography>
              <Typography variant="small" color="gray" className="mb-4">
                Get started by creating your first floor
              </Typography>
              <Button onClick={() => handleOpenDialog()} color="blue">
                Add Floor
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Location ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Places</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFloors.map((floor) => (
                    <React.Fragment key={floor.id}>
                      <tr className="border-b border-stone-200 hover:bg-stone-50 transition">
                        <td className="px-6 py-4">
                          <IconButton
                            variant="text"
                            onClick={() => toggleRowExpand(floor.id)}
                            size="sm"
                            className="text-stone-500 hover:text-stone-700">
                            {expandedRows[floor.id] ? (
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
                            {floor.id}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {floor.name || 'Unnamed Floor'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="gray">
                            {floor.locationId || floor.location?.id || 'N/A'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="gray">
                            {floor.places?.length || 0}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <IconButton
                              variant="text"
                              color="blue"
                              onClick={() => handleOpenDetails(floor)}
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
                              onClick={() => handleOpenDialog(floor)}
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
                              onClick={() => handleDeleteClick(floor.id)}
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
                      {expandedRows[floor.id] && (
                        <tr className="bg-stone-50 border-b border-stone-200">
                          <td colSpan="6" className="px-6 py-4">
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
                                        ID:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {floor.id}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Name:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {floor.name || 'N/A'}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Location ID:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {floor.locationId || floor.location?.id || 'N/A'}
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
                                        Places Count:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {floor.places?.length || 0}
                                      </Typography>
                                    </div>
                                    {floor.location && (
                                      <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Location:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold max-w-xs text-right">
                                          {floor.location.address || JSON.stringify(floor.location)}
                                        </Typography>
                                      </div>
                                    )}
                                    {floor.createdAt && (
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Created At:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {new Date(floor.createdAt).toLocaleDateString()}
                                        </Typography>
                                      </div>
                                    )}
                                    {floor.updatedAt && (
                                      <div className="flex justify-between items-center">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Updated At:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {new Date(floor.updatedAt).toLocaleDateString()}
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
            {floors.length > 0 && (
              <div className="text-center mt-4 pb-4">
                <Typography variant="small" color="gray">
                  Showing {startIndex + 1} to {Math.min(endIndex, floors.length)} of {floors.length} floors
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
        size="md"
        className="max-h-[90vh]"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <Typography variant="h4" color="blue-gray">
            {editingFloor ? 'Edit Floor' : 'Create New Floor'}
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
              <Input
                label="Floor Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                type="number"
                label="Location ID"
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                required
                min="1"
              />
              <Typography variant="small" color="gray" className="text-xs">
                Enter the location ID where this floor belongs
              </Typography>
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
              {editingFloor ? 'Update Floor' : 'Create Floor'}
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
            Delete Floor
          </Typography>
        </DialogHeader>
        <DialogBody divider>
          <Typography>
            Are you sure you want to delete this floor? This action cannot be undone.
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
            Delete Floor
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Floor Details Dialog */}
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
            Floor Details
          </Typography>
        </DialogHeader>
        <DialogBody divider className="max-h-[70vh] overflow-y-auto">
          {selectedFloor ? (
            <div className="space-y-6">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Basic Information
                </Typography>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      ID:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedFloor.id}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Name:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedFloor.name || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Location ID:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedFloor.locationId || selectedFloor.location?.id || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Places Count:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedFloor.places?.length || 0}
                    </Typography>
                  </div>
                </div>
              </div>

              {selectedFloor.location && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Location Information
                  </Typography>
                  <div className="space-y-2">
                    {selectedFloor.location.address && (
                      <div className="flex justify-between">
                        <Typography variant="small" color="gray" className="font-semibold">
                          Address:
                        </Typography>
                        <Typography variant="small" color="blue-gray" className="text-right max-w-xs">
                          {selectedFloor.location.address}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedFloor.places && selectedFloor.places.length > 0 && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Places ({selectedFloor.places.length})
                  </Typography>
                  <div className="space-y-2">
                    {selectedFloor.places.map((place, index) => (
                      <div key={place.id || index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <Typography variant="small" color="gray" className="font-semibold">
                            Place {index + 1}:
                          </Typography>
                          <Typography variant="small" color="blue-gray">
                            {place.name || `ID: ${place.id}`}
                          </Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedFloor.createdAt || selectedFloor.updatedAt) && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Timestamps
                  </Typography>
                  <div className="space-y-2">
                    {selectedFloor.createdAt && (
                      <div className="flex justify-between">
                        <Typography variant="small" color="gray" className="font-semibold">
                          Created At:
                        </Typography>
                        <Typography variant="small" color="blue-gray">
                          {new Date(selectedFloor.createdAt).toLocaleString()}
                        </Typography>
                      </div>
                    )}
                    {selectedFloor.updatedAt && (
                      <div className="flex justify-between">
                        <Typography variant="small" color="gray" className="font-semibold">
                          Updated At:
                        </Typography>
                        <Typography variant="small" color="blue-gray">
                          {new Date(selectedFloor.updatedAt).toLocaleString()}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Typography variant="small" color="gray">
                No floor selected
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

