import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Dialog, DialogHeader, DialogBody, DialogFooter } from '@material-tailwind/react';
import { getUsers, getUserById, activateUser, deactivateUser } from '../../services/api';

// User Card Component
const UserCard = ({ user, onOpenDetails, onToggleActivation }) => {
  const [avatarError, setAvatarError] = useState(false);

  // Extract name and surname from fullName
  const fullName = user.fullName || '';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || user.username || '';
  const surname = nameParts.slice(1).join(' ') || '';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody>
        {/* Avatar/Logo */}
        <div className="mb-4 flex justify-center">
          {user.profilePicture && !avatarError ? (
            <img 
              src={user.profilePicture} 
              alt={user.fullName || user.username || 'User avatar'} 
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold border-2 border-gray-300 dark:border-gray-600">
              {(firstName?.charAt(0) || user.username?.trim()?.charAt(0) || 'U').toUpperCase()}
            </div>
          )}
        </div>

        {/* User Name and Surname */}
        <div className="text-center mb-4">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            {firstName}
          </Typography>
          {surname && (
            <Typography variant="small" color="gray" className="font-medium">
              {surname}
            </Typography>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            color="blue"
            onClick={() => onOpenDetails(user)}
            className="flex-1">
            Open
          </Button>
          <Button
            size="sm"
            variant={user.isActive ? "outlined" : "filled"}
            color={user.isActive ? "red" : "green"}
            onClick={() => onToggleActivation(user.id, !user.isActive)}
            className="flex-1">
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setProcessing(true);
      setError('');
      
      console.log('Fetching user...');
      const response = await getUsers();
      console.log('Response received:', response);
      
      // Handle different response structures
      let usersList = [];
      
      if (Array.isArray(response)) {
        usersList = response;
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          usersList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          usersList = response.data.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          usersList = response.data.users;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          usersList = response.data.items;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          usersList = response.data.results;
        }
      } else if (response.users && Array.isArray(response.users)) {
        usersList = response.users;
      } else if (response.items && Array.isArray(response.items)) {
        usersList = response.items;
      } else if (response.results && Array.isArray(response.results)) {
        usersList = response.results;
      }
      
      console.log('Processed user:', usersList.length, 'user');
      
      if (usersList.length > 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setUsers(usersList);
      
      if (usersList.length === 0) {
        console.warn('No user found in response. Full response:', response);
        setError('No user found. The response structure might be different than expected.');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message || 'Failed to load user. Please check the console for details.');
      setUsers([]);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleOpenDetails = (user) => {
    setSelectedUser(user);
    setAvatarError(false);
    setOpenDetailsDialog(true);
  };

  // Pagination calculations
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const handleToggleActivation = async (id, newStatus) => {
    try {
      setError('');
      const wasLastItemOnPage = paginatedUsers.length === 1;
      const wasNotFirstPage = currentPage > 1;
      
      if (newStatus) {
        await activateUser(id);
      } else {
        await deactivateUser(id);
      }
      
      await fetchUsers();
      
      // If current page becomes empty after deactivation, go to previous page
      if (!newStatus && wasLastItemOnPage && wasNotFirstPage) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err.message || `Failed to ${newStatus ? 'activate' : 'deactivate'} user`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Card className="animate-pulse">
      <CardBody>
        <div className="mb-4 flex justify-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-1"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
        <div className="flex gap-2 pt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col max-h-screen overflow-hidden">
        <div className="flex-shrink-0 space-y-6 pb-4">
          <div className="flex justify-between items-center">
            <Typography variant="h3" color="blue-gray">
              User
            </Typography>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading user...</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(20)].map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-screen overflow-hidden">
      <div className="flex-shrink-0 space-y-6 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h3" color="blue-gray">
              User
            </Typography>
            {users.length > 0 && (
              <Typography variant="small" color="gray" className="mt-1">
                {users.length} {users.length === 1 ? 'user' : 'user'} found
              </Typography>
            )}
          </div>
        </div>

        {processing && !loading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400"></div>
            <span>Processing user data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            <div className="font-semibold mb-1">Error loading user</div>
            <div className="text-sm">{error}</div>
            <Button 
              size="sm" 
              color="red" 
              variant="outlined" 
              className="mt-2"
              onClick={fetchUsers}>
              Retry
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Typography variant="h6" color="gray" className="mb-2">
                No user found
              </Typography>
              <Typography variant="small" color="gray" className="mb-4">
                No users available
              </Typography>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {paginatedUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onOpenDetails={handleOpenDetails}
                  onToggleActivation={handleToggleActivation}
                />
              ))}
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
            {users.length > 0 && (
              <div className="text-center mt-4 pb-4">
                <Typography variant="small" color="gray">
                  Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} user
                </Typography>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={openDetailsDialog} handler={() => setOpenDetailsDialog(false)} size="lg">
        <DialogHeader>User Details</DialogHeader>
        <DialogBody className="max-h-[70vh] overflow-y-auto">
          {selectedUser && (
            <div className="space-y-6">
              {/* Avatar */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Profile Picture
                </Typography>
                {selectedUser.profilePicture && !avatarError ? (
                  <img 
                    src={selectedUser.profilePicture} 
                    alt={selectedUser.fullName || selectedUser.username || 'User avatar'} 
                    className="w-full max-w-md h-64 object-cover rounded-lg"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-full max-w-md h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl font-semibold">
                      {(selectedUser.fullName?.trim()?.charAt(0) || selectedUser.username?.trim()?.charAt(0) || 'U').toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Info */}
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
                      {selectedUser.id}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Username:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedUser.username || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Full Name:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedUser.fullName || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Email:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedUser.email || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Phone:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedUser.phone || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Status:
                    </Typography>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      selectedUser.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {selectedUser.role && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Role:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {selectedUser.role}
                      </Typography>
                    </div>
                  )}
                  {selectedUser.createdAt && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Created At:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
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
    </div>
  );
}

