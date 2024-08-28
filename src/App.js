import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';

import Home from './component/Home';
import Login from './component/Login';
import Header from "./component/common/Header"
import Signup from './component/Signup';
import UserHome from './component/UserHome';
import Error from './component/Error';
import UserBoard from './component/UserBoard';
import UserBoardCreateUpdate from './component/UserBoardCreateUpdate';
import HomeLayout from './component/HomeLayout';
import UserSetting from './component/UserSetting';
function App() {
  return (
    <div style = { {"minWidth": "1000px"} }>
      <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          
        <Route path = "/" element = {<HomeLayout />}>
          <Route index element = {<Home />}></Route>      
          <Route path = ":username" element = {<UserHome />}></Route>
          <Route path = ":username/new" element = {<UserBoardCreateUpdate />}></Route> 
          <Route path = ":username/:id" element = {<UserBoard />}></Route>
          <Route path = ":username/setting" element = {<UserSetting />}></Route>
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
