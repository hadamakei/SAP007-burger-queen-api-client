import logo from "../../Images/logotipo.png";
import "./styles.css";

function Header() {
  return (
    <div
      className="container-logotype">
      <img src={logo} alt="logotipo" />
    </div>
  );
}

export default Header;