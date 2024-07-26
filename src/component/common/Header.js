import { Link } from "react-router-dom"

export default function Header(){
    return (
        <Link to = "/" style={linkStyle}>
            <div style = {headerOuter}>
                <div style = {headerText}>
                    Blog
                </div>
            </div>
        </Link>
        
    )
}

const headerOuter = {
    "width": "100%",
    "height": "100px", 
    "backgroundColor": "#728d9c",

    "display": "flex",
    "alignItems": "center",

    "padding": "0px 30px"
}

const headerText = {
    "color": "white",
    "fontWeight": "bold",
    "fontSize": "40px",
}

const linkStyle = {
    "textDecoration": "none"
}