import { Outlet } from "react-router-dom";
import Header from "./common/Header";
import UserHeader from "./common/UserHeader";

export default function HomeLayout() {
    return (
        <div>
            <UserHeader />
            <Outlet />
        </div>
    )
}