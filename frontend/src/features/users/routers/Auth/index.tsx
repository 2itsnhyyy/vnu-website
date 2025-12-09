import Login from '../../pages/Auth/Login';
import RegisterDetails from '../../pages/Auth/Register/RegisterDetails';
import RegisterCommon from '../../pages/Auth/Register/RegisterCommon';
import ForgotPassword from '../../pages/Auth/ForgotPassword';
import ResetPassword from '../../pages/Auth/ResetPassword';
import VerifyOtp from '../../pages/Auth/VerifyOTP';

const AuthRouters = [
  {
    path: '/users/login',
    element: <Login />,
  },
  {
    path: '/users/register/common',
    element: <RegisterCommon />,
  },
  {
    path: '/users/register/details',
    element: <RegisterDetails />,
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