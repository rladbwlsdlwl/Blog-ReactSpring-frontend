import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';

import Home from './component/Home';
import Login from './component/Login';
import Header from "./component/common/Header"
import Signup from './component/Signup';
import UserHome from './component/UserHome';
import Error from './component/Error';
import UserBoard from './component/UserBoard';
import UserBoardCreate from './component/UserBoardCreate';
import UserHeader from './component/common/UserHeader';
import HomeLayout from './component/HomeLayout';
function App() {
  return (
    <div>
      <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          
        <Route path = "/" element = {<HomeLayout />}>
          <Route index element = {<Home />}></Route>      
          <Route path = ":username" element = {<UserHome />}></Route>
          <Route path = ":username/create" element = {<UserBoardCreate />}></Route> 
          <Route path = ":username/:id" element = {<UserBoard />}></Route>
        </Route>

        <Route path = "/auth/login" element = {<Login />}></Route>
        <Route path = "/auth/signup" element = {<Signup />}></Route>
        <Route path = "/*" element = {<Error />}></Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </div>
  );
}


export default App;
