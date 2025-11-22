import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, IconButton, Textarea } from '@material-tailwind/react';
import { getCompanyCategories, getCompanyCategoryById, createCompanyCategory, updateCompanyCategory, deleteCompanyCategory } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export default function CompanyCategories() {
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = settings.itemsPerPage;
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setProcessing(true);
      setError('');
      
      console.log('Fetching company categories...');
      const response = await getCompanyCategories();
      console.log('Response received:', response);
      
      // API response structure: { data: { data: [...], message: "..." } }
      let categoriesList = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        categoriesList = response.data.data;
      } else if (Array.isArray(response)) {
        categoriesList = response;
      } else if (response.data && Array.isArray(response.data)) {
        categoriesList = response.data;
      }
      
      console.log('Processed categories:', categoriesList.length, 'categories');
      
      if (categoriesList.length > 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setCategories(categoriesList);
      
      if (categoriesList.length === 0) {
        console.warn('No categories found in response. Full response:', response);
        setError('No categories found.');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories. Please check the console for details.');
      setCategories([]);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleOpenDetails = async (category) => {
    try {
      setError('');
      const categoryDetails = await getCompanyCategoryById(category.id);
      // API response structure: { data: { data: {...}, message: "..." } }
      const categoryData = categoryDetails?.data?.data || categoryDetails?.data || categoryDetails || category;
      setSelectedCategory(categoryData);
      setOpenDetailsDialog(true);
    } catch (err) {
      setError(err.message || 'Failed to load category details');
      setSelectedCategory(category);
      setOpenDetailsDialog(true);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (editingCategory) {
        await updateCompanyCategory(editingCategory.id, formData);
      } else {
        await createCompanyCategory(formData);
      }
      
      handleCloseDialog();
      fetchCategories();
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      await deleteCompanyCategory(deleteId);
      const wasLastItemOnPage = paginatedCategories.length === 1;
      const wasNotFirstPage = currentPage > 1;
      setOpenDeleteDialog(false);
      setDeleteId(null);
      await fetchCategories();
      if (wasLastItemOnPage && wasNotFirstPage) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete category');
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
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading company categories...</p>
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
                Company Categories
              </Typography>
              {categories.length > 0 && (
                <Typography variant="small" color="gray" className="mt-1">
                  {categories.length} {categories.length === 1 ? 'category' : 'categories'} found
                </Typography>
              )}
            </div>
            <Button onClick={() => handleOpenDialog()} color="blue" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </Button>
          </div>

          {processing && !loading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400"></div>
              <span>Processing category data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
              <div className="font-semibold mb-1 text-sm">Error loading categories</div>
              <div className="text-sm">{error}</div>
              <Button 
                size="sm"
                variant="outlined"
                color="red"
                onClick={fetchCategories}
                className="mt-3">
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Table Section */}
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-950 mb-2">
              No categories found
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Get started by creating your first category
            </p>
            <Button onClick={() => handleOpenDialog()} color="blue">
              Add Category
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCategories.map((category) => (
                    <React.Fragment key={category.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <IconButton
                            variant="text"
                            onClick={() => toggleRowExpand(category.id)}
                            size="sm"
                            className="text-gray-500 hover:text-gray-950">
                            {expandedRows[category.id] ? (
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-950">
                            {category.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-950">
                            {category.name || 'Unnamed Category'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 max-w-md truncate block">
                            {category.description || 'No description'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap pl-10">
                          <div className="flex gap-2">
                            <IconButton
                              variant="text"
                              color="blue"
                              onClick={() => handleOpenDetails(category)}
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
                              onClick={() => handleOpenDialog(category)}
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
                              onClick={() => handleDeleteClick(category.id)}
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
                      {expandedRows[category.id] && (
                        <tr className="bg-gray-50">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <h4 className="font-semibold text-gray-950 mb-4 text-sm">Category Information</h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-600">ID:</span>
                                    <span className="font-medium text-gray-950">{category.id}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-600">Name:</span>
                                    <span className="font-medium text-gray-950">{category.name || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Description:</span>
                                    <span className="font-medium text-gray-950 max-w-xs text-right">{category.description || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-950 mb-4 text-sm">Additional Details</h4>
                                <div className="space-y-3 text-sm">
                                  {category.createdAt && (
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                      <span className="text-gray-600">Created At:</span>
                                      <span className="font-medium text-gray-950">
                                        {new Date(category.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  {category.updatedAt && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Updated At:</span>
                                      <span className="font-medium text-gray-950">
                                        {new Date(category.updatedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
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
            {categories.length > 0 && (
              <div className="text-center mt-4 pb-4">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, categories.length)} of {categories.length} categories
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader>
          {editingCategory ? 'Edit Category' : 'Create New Category'}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <Input
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Enter category description"
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleCloseDialog}
              className="mr-1">
              Cancel
            </Button>
            <Button type="submit" color="blue">
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Category Details Dialog */}
      <Dialog open={openDetailsDialog} handler={() => setOpenDetailsDialog(false)} size="lg">
        <DialogHeader>Category Details</DialogHeader>
        <DialogBody className="max-h-[70vh] overflow-y-auto">
          {selectedCategory && (
            <div className="space-y-6">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Category Information
                </Typography>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      ID:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedCategory.id}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Name:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedCategory.name || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Description:
                    </Typography>
                    <Typography variant="small" color="blue-gray" className="text-right max-w-xs">
                      {selectedCategory.description || 'N/A'}
                    </Typography>
                  </div>
                  {selectedCategory.createdAt && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Created At:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {new Date(selectedCategory.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                  )}
                  {selectedCategory.updatedAt && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Updated At:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {new Date(selectedCategory.updatedAt).toLocaleString()}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenDetailsDialog(false)}
            className="mr-1">
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        handler={() => setOpenDeleteDialog(false)} 
        size="sm"
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <Typography variant="h5" color="red">
            Delete Category
          </Typography>
        </DialogHeader>
        <DialogBody divider>
          <Typography>
            Are you sure you want to delete this category? This action cannot be undone.
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
            Delete Category
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

