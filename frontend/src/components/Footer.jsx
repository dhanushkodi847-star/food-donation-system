import { MdFoodBank } from 'react-icons/md';
import { FiHeart, FiMail, FiPhone } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <MdFoodBank className="footer-logo-icon" />
            <span>FoodShare</span>
          </div>
          <p className="footer-tagline">
            Connecting surplus food with those who need it most.
          </p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="/register/donor">Become a Donor</a>
          <a href="/register/receiver">Become a Receiver</a>
          <a href="/login">Login</a>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p><FiMail /> support@foodshare.com</p>
          <p><FiPhone /> +91 98765 43210</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          Made with <FiHeart className="footer-heart" /> by Dhanush &bull; &copy; {new Date().getFullYear()} FoodShare. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
