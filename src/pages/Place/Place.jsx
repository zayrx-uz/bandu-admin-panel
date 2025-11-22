import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, IconButton, Checkbox, Select, Option } from '@material-tailwind/react';
import { getPlaces, getPlaceById, createPlace, updatePlace, deletePlace, getPlacesByCompany, getPlacesByFloor } from '../../services/api';
import { getCompanies } from '../../services/api';
import { getFloors } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export default function Place() {
  const { settings } = useSettings();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = settings.itemsPerPage;
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [editingPlace, setEditingPlace] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableFloors, setAvailableFloors] = useState([]);
  const [filterCompanyId, setFilterCompanyId] = useState('');
  const [filterFloorId, setFilterFloorId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    floorId: '',
    capacity: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPlaces();
    fetchCompanies();
    fetchFloors();
  }, [filterCompanyId, filterFloorId]);

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
      const response = await getFloors();
      const floorsList = response?.data?.data || response?.data || response || [];
      setAvailableFloors(Array.isArray(floorsList) ? floorsList : []);
    } catch (err) {
      console.error('Error fetching floors:', err);
    }
  };

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setProcessing(true);
      setError('');
      
      console.log('Fetching places...');
      let response;
      
      if (filterCompanyId) {
        response = await getPlacesByCompany(filterCompanyId);
      } else if (filterFloorId) {
        response = await getPlacesByFloor(filterFloorId);
      } else {
        const params = {};
        if (filterCompanyId) params.companyId = filterCompanyId;
        if (filterFloorId) params.floorId = filterFloorId;
        response = await getPlaces(params);
      }
      
      console.log('Response received:', response);
      
      let placesList = [];
      
      if (Array.isArray(response)) {
        placesList = response;
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          placesList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          placesList = response.data.data;
        } else if (response.data.places && Array.isArray(response.data.places)) {
          placesList = response.data.places;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          placesList = response.data.items;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          placesList = response.data.results;
        }
      } else if (response.places && Array.isArray(response.places)) {
        placesList = response.places;
      } else if (response.items && Array.isArray(response.items)) {
        placesList = response.items;
      } else if (response.results && Array.isArray(response.results)) {
        placesList = response.results;
      }
      
      console.log('Processed places:', placesList.length, 'places');
      
      if (placesList.length > 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setPlaces(placesList);
      
      if (placesList.length === 0) {
        console.warn('No places found in response. Full response:', response);
        setError('No places found.');
      }
    } catch (err) {
      console.error('Error fetching places:', err);
      setError(err.message || 'Failed to load places. Please check the console for details.');
      setPlaces([]);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleOpenDetails = async (place) => {
    try {
      setError('');
      const placeDetails = await getPlaceById(place.id);
      const placeData = placeDetails?.data?.data || placeDetails?.data || placeDetails || place;
      setSelectedPlace(placeData);
      setOpenDetailsDialog(true);
    } catch (err) {
      setError(err.message || 'Failed to load place details');
      setSelectedPlace(place);
      setOpenDetailsDialog(true);
    }
  };

  const handleOpenDialog = (place = null) => {
    if (place) {
      setEditingPlace(place);
      setFormData({
        name: place.name || '',
        floorId: place.floorId?.toString() || place.floor?.id?.toString() || '',
        capacity: place.capacity?.toString() || '',
        isActive: place.isActive !== undefined ? place.isActive : true,
      });
    } else {
      setEditingPlace(null);
      setFormData({
        name: '',
        floorId: '',
        capacity: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlace(null);
    setFormData({
      name: '',
      floorId: '',
      capacity: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      const placeData = {
        name: formData.name,
        floorId: parseInt(formData.floorId),
        capacity: formData.capacity ? parseInt(formData.capacity) : 0,
        isActive: formData.isActive || false,
      };

      if (editingPlace) {
        await updatePlace(editingPlace.id, placeData);
      } else {
        await createPlace(placeData);
      }
      
      handleCloseDialog();
      fetchPlaces();
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to save place');
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      await deletePlace(deleteId);
      const wasLastItemOnPage = paginatedPlaces.length === 1;
      const wasNotFirstPage = currentPage > 1;
      setOpenDeleteDialog(false);
      setDeleteId(null);
      await fetchPlaces();
      if (wasLastItemOnPage && wasNotFirstPage) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete place');
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
  const totalPages = Math.ceil(places.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlaces = places.slice(startIndex, endIndex);

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
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading places...</p>
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
                Places
              </Typography>
              {places.length > 0 && (
                <Typography variant="small" color="gray" className="mt-1">
                  {places.length} {places.length === 1 ? 'place' : 'places'} found
                </Typography>
              )}
            </div>
            <Button onClick={() => handleOpenDialog()} color="blue" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Place
            </Button>
          </div>

          {/* Filter Section */}
          <div className="mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Select
                label="Filter by Company"
                value={filterCompanyId}
                onChange={(val) => {
                  setFilterCompanyId(val);
                  setFilterFloorId(''); // Clear floor filter when company is selected
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
              <Select
                label="Filter by Floor"
                value={filterFloorId}
                onChange={(val) => {
                  setFilterFloorId(val);
                  setFilterCompanyId(''); // Clear company filter when floor is selected
                  setCurrentPage(1);
                }}
                className="max-w-xs">
                <Option value="">All Floors</Option>
                {availableFloors.map((floor) => (
                  <Option key={floor.id} value={floor.id.toString()}>
                    {floor.name}
                  </Option>
                ))}
              </Select>
              {(filterCompanyId || filterFloorId) && (
                <Button
                  variant="outlined"
                  color="gray"
                  size="sm"
                  onClick={() => {
                    setFilterCompanyId('');
                    setFilterFloorId('');
                    setCurrentPage(1);
                  }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {processing && !loading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400"></div>
              <span>Processing place data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              <div className="font-semibold mb-1">Error loading places</div>
              <div className="text-sm">{error}</div>
              <Button 
                size="sm" 
                color="red" 
                variant="outlined" 
                className="mt-2"
                onClick={fetchPlaces}>
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Table Section */}
        {places.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Typography variant="h6" color="gray" className="mb-2">
                No places found
              </Typography>
              <Typography variant="small" color="gray" className="mb-4">
                Get started by creating your first place
              </Typography>
              <Button onClick={() => handleOpenDialog()} color="blue">
                Add Place
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Floor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Capacity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPlaces.map((place) => (
                    <React.Fragment key={place.id}>
                      <tr className="border-b border-stone-200 hover:bg-stone-50 transition">
                        <td className="px-6 py-4">
                          <IconButton
                            variant="text"
                            onClick={() => toggleRowExpand(place.id)}
                            size="sm"
                            className="text-stone-500 hover:text-stone-700">
                            {expandedRows[place.id] ? (
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
                            {place.id}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {place.name || 'Unnamed Place'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="gray">
                            {place.floor?.name || (place.floorId ? `Floor ID: ${place.floorId}` : 'N/A')}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {place.capacity || 0}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            place.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {place.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <IconButton
                              variant="text"
                              color="blue"
                              onClick={() => handleOpenDetails(place)}
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
                              onClick={() => handleOpenDialog(place)}
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
                              onClick={() => handleDeleteClick(place.id)}
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
                      {expandedRows[place.id] && (
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
                                        ID:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {place.id}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Name:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {place.name || 'N/A'}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Capacity:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {place.capacity || 0}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Status:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {place.isActive ? 'Active' : 'Inactive'}
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
                                        Floor:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {place.floor?.name || (place.floorId ? `ID: ${place.floorId}` : 'N/A')}
                                      </Typography>
                                    </div>
                                    {place.company && (
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Company:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {place.company.name}
                                        </Typography>
                                      </div>
                                    )}
                                    {place.location && (
                                      <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Location:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold max-w-xs text-right">
                                          {place.location.address || JSON.stringify(place.location)}
                                        </Typography>
                                      </div>
                                    )}
                                    {place.createdAt && (
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Created At:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {new Date(place.createdAt).toLocaleDateString()}
                                        </Typography>
                                      </div>
                                    )}
                                    {place.updatedAt && (
                                      <div className="flex justify-between items-center">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Updated At:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {new Date(place.updatedAt).toLocaleDateString()}
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
            {places.length > 0 && (
              <div className="text-center mt-4 pb-4">
                <Typography variant="small" color="gray">
                  Showing {startIndex + 1} to {Math.min(endIndex, places.length)} of {places.length} places
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
            {editingPlace ? 'Edit Place' : 'Create New Place'}
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
                label="Place Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Table 5"
              />
              <Select
                label="Floor"
                value={formData.floorId}
                onChange={(val) => setFormData({ ...formData, floorId: val })}
                required>
                {availableFloors.map((floor) => (
                  <Option key={floor.id} value={floor.id.toString()}>
                    {floor.name}
                  </Option>
                ))}
              </Select>
              <Input
                type="number"
                label="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                min="1"
                placeholder="Number of people"
              />
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
              {editingPlace ? 'Update Place' : 'Create Place'}
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
            Delete Place
          </Typography>
        </DialogHeader>
        <DialogBody divider>
          <Typography>
            Are you sure you want to delete this place? This action cannot be undone.
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
            Delete Place
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Place Details Dialog */}
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
            Place Details
          </Typography>
        </DialogHeader>
        <DialogBody divider className="max-h-[70vh] overflow-y-auto">
          {selectedPlace ? (
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
                      {selectedPlace.id}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Name:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedPlace.name || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Capacity:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedPlace.capacity || 0}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Status:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedPlace.isActive ? 'Active' : 'Inactive'}
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
                      Floor:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedPlace.floor?.name || (selectedPlace.floorId ? `ID: ${selectedPlace.floorId}` : 'N/A')}
                    </Typography>
                  </div>
                  {selectedPlace.company && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Company:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {selectedPlace.company.name}
                      </Typography>
                    </div>
                  )}
                  {selectedPlace.location && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Location:
                      </Typography>
                      <Typography variant="small" color="blue-gray" className="text-right max-w-xs">
                        {selectedPlace.location.address || JSON.stringify(selectedPlace.location)}
                      </Typography>
                    </div>
                  )}
                  {selectedPlace.createdAt && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Created At:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {new Date(selectedPlace.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                  )}
                  {selectedPlace.updatedAt && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Updated At:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {new Date(selectedPlace.updatedAt).toLocaleString()}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Typography variant="small" color="gray">
                No place selected
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

