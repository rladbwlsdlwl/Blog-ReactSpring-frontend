import { Link } from "react-router-dom"
import "../../css/Header.css"

export default function Header(){
    return (
        <Link to = "/" className="headerLink">
            <div className="headerOuter">
                <div className="headerText">
                    Blog
                </div>
            </div>
        </Link>
        
    )
}