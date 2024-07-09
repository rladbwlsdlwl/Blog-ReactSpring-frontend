export default function Header(){
    return (
        <div style = {headerOuter}>
            <div style = {headerText}>
                Blog
            </div>
        </div>
    )
}

const headerOuter = {
    "width": "100%",
    "height": "100px", 
    "background-color": "#15d4cd",

    "display": "flex",
    "align-items": "center",

    "padding": "0px 30px"
}

const headerText = {
    "color": "white",
    "font-weight": "bold",
    "font-size": "40px",
}