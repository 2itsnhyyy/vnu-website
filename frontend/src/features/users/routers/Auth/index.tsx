import Login from '../../pages/Auth/Login';
import RegisterDetails from '../../pages/Auth/Register/RegisterDetails';
import RegisterCommon from '../../pages/Auth/Register/RegisterCommon';
import ForgotPassword from '../../pages/Auth/ForgotPassword';
import ResetPassword from '../../pages/Auth/ResetPassword';
import VerifyOtp from '../../pages/Auth/VerifyOTP';

const AuthRouters = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register/common',
    element: <RegisterCommon />,
  },
  {
    path: '/register/details',
    element: <RegisterDetails />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/verify-otp',
    element: <VerifyOtp />,
  }
];

export default AuthRouters;