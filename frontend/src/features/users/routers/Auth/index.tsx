import Login from '../../pages/Auth/Login';
import Register from '../../pages/Auth/Register';
import ForgotPassword from '../../pages/Auth/ForgotPassword';

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
];

export default AuthRouters;