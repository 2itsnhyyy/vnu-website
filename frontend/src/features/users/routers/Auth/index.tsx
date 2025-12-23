import Login from '../../pages/Auth/Login';
import Register from '../../pages/Auth/Register';
import ForgotPassword from '../../pages/Auth/ForgotPassword';
import ResetPassword from '../../pages/Auth/ResetPassword';
import VerifyOtp from '../../pages/Auth/VerifyOTP';

const AuthRouters = [
  {
    path: '/users/login',
    element: <Login />,
  },
  {
    path: '/users/register',
    element: <Register />,
  },
  {
    path: '/users/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/users/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/users/verify-otp',
    element: <VerifyOtp />,
  }
];

export default AuthRouters;