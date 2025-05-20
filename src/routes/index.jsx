import { createBrowserRouter, Navigate } from 'react-router-dom';
import Template from '../layouts/Template';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

import PrivatePage from './PrivatePage';
import PrivateLogin from './PrivateLogin';

import MembersIndex from '../pages/members/Index';
import BooksIndex from '../pages/books/Index';
import LoansIndex from '../pages/loans/IndexLoans';
import LoanChart from '../pages/loans/Chart';
import FineIndex from '../pages/fines/Index';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PrivateLogin>
        <Login />
      </PrivateLogin>
    ),
  },
  {
    path: '/',
    element: (
      <PrivatePage>
        <Template />
      </PrivatePage>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/members',
        element: <MembersIndex />,
      },
      {
        path: '/books',
        element: <BooksIndex />,
      },
      {
        path: '/loans',
        element: <LoansIndex />,
      },
      {
        path: '/loans/chart',
        element: <LoanChart />,
      },
      {
        path: '/fines',
        element: <FineIndex />,
      },
    ],
  },
]);
