import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Card, CardBody } from '@material-tailwind/react';

const Eror = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full shadow-lg">
        <CardBody className="text-center py-12 px-8">
          <div className="mb-8">
            <Typography variant="h1" color="blue-gray" className="text-9xl font-bold mb-4">
              404
            </Typography>
            <Typography variant="h3" color="blue-gray" className="mb-2">
              Page Not Found
            </Typography>
            <Typography variant="paragraph" color="gray" className="text-lg">
              Oops! The page you're looking for doesn't exist or has been moved.
            </Typography>
          </div>

          {/* 404 Illustration */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-64 h-64">
              <svg
                className="w-full h-full text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              color="blue"
              size="lg"
              onClick={() => navigate('/')}
              className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go to Home
            </Button>
            <Button
              variant="outlined"
              color="blue-gray"
              size="lg"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Eror;