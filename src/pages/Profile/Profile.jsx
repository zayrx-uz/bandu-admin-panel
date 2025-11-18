import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, Typography, Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    // Reset image error when profile picture changes
    setImageError(false);
  }, [user?.profilePicture]);

  // Helper to check if profile picture is valid
  const hasValidProfilePicture = user?.profilePicture && typeof user.profilePicture === 'string' && user.profilePicture.trim() !== '' && !imageError;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Typography variant="h3" color="blue-gray" className="mb-8">
          Profile
        </Typography>

        <Card>
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
              <div className="relative w-24 h-24 rounded-full border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-blue-500 flex items-center justify-center">
                {hasValidProfilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user?.fullName || 'User'}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-white font-semibold text-2xl">
                    {(user?.fullName?.trim()?.charAt(0) || user?.username?.trim()?.charAt(0) || 'U').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <Typography variant="h4" color="blue-gray" className="mb-2">
                  {user?.fullName || 'User'}
                </Typography>
                <Typography variant="small" color="gray" className="mb-1">
                  Role: <span className="font-semibold">{user?.role || 'N/A'}</span>
                </Typography>
                {user?.email && (
                  <Typography variant="small" color="gray">
                    Email: {user?.email}
                  </Typography>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <Typography variant="small" color="gray" className="mb-1">
                  First Name
                </Typography>
                <Typography variant="h6" color="blue-gray">
                  {user?.firstName || 'N/A'}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="mb-1">
                  Last Name
                </Typography>
                <Typography variant="h6" color="blue-gray">
                  {user?.lastName || 'N/A'}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="mb-1">
                  Birth Date
                </Typography>
                <Typography variant="h6" color="blue-gray">
                  {formatDate(user?.birthDate)}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="mb-1">
                  Gender
                </Typography>
                <Typography variant="h6" color="blue-gray">
                  {user?.gender || 'N/A'}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="mb-1">
                  Verified
                </Typography>
                <Typography variant="h6" color={user?.verified ? 'green' : 'red'}>
                  {user?.verified ? 'Yes' : 'No'}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="mb-1">
                  Status
                </Typography>
                <Typography variant="h6" color={user?.isBlocked ? 'red' : 'green'}>
                  {user?.isBlocked ? 'Blocked' : 'Active'}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="mb-1">
                  Created At
                </Typography>
                <Typography variant="h6" color="blue-gray">
                  {formatDate(user?.createdAt)}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="mb-1">
                  Updated At
                </Typography>
                <Typography variant="h6" color="blue-gray">
                  {formatDate(user?.updatedAt)}
                </Typography>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="gradient"
                color="red"
                onClick={handleLogout}
                className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Log Out
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

