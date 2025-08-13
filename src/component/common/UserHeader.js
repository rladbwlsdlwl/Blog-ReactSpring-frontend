import { useContext, useState } from "react"
import { AuthContext } from "../../context/AuthProvider"
import { Link } from "react-router-dom"
import "../../css/common.css"
import "../../css/UserHeader.css"

export default function UserHeader(){
    const {gettingUserEmail, gettingUsername} = useContext(AuthContext)
    const [username, email] = [gettingUsername(), gettingUserEmail()]

    // console.log(username)
    // console.log(email)
    if(username == ""){
        return (
            <div className = "userHeaderOuter">
                <div className = "userHeaderInner">
                    <Link to = "/auth/login" className="link">
                        로그인
                    </Link>
                </div>
                <div className = "userHeaderInner">
                    <Link to ="/auth/signup" className="link">
                        회원가입
                    </Link>
                </div>      
            </div>
        )
    }

    return (
        <div className = "userHeaderOuter">
            <div className = "userHeaderInner">
                <Link to = { `/auth/setting`} className="link">
                    {username} 님
                </Link>  
            </div>
            <div className = "userHeaderInner">
                <Link to = {`/${username}`} className="link">
                    내 블로그
                </Link>  
            </div>
        </div>
    )
}