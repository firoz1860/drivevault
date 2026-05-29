import React from "react";
import { assets } from "../assets/assets";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 mt-48 text-sm text-gray-500">
      <motion.div
        {...fadeUp(0)}
        className="flex flex-wrap justify-between items-start gap-10 pb-10 border-b border-borderColor"
      >
        <div className="max-w-sm">
          <motion.div {...fadeUp(0.2)} className="logo-3d-shell inline-flex rounded-xl px-1 py-1 mb-3">
            <img
              src={assets.logo}
              alt="DriveVault"
              className="logo-3d-mark h-9 w-auto"
            />
          </motion.div>

          <motion.p {...fadeUp(0.3)} className="leading-relaxed">
            DriveVault is a premium mobility platform with a wide selection of luxury and
            everyday vehicles for every kind of trip.
          </motion.p>

          <motion.div
            {...fadeUp(0.4)}
            className="flex items-center gap-4 mt-6"
          >
            {[assets.facebook_logo, assets.instagram_logo, assets.twitter_logo, assets.gmail_logo].map(
              (logo, i) => (
                <a key={i} href="#">
                  <img src={logo} className="w-5 h-5 hover:opacity-70 transition" />
                </a>
              )
            )}
          </motion.div>
        </div>

        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-wrap justify-between w-full md:w-1/2 gap-10"
        >
          <div>
            <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
              Quick Links
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              <li><Link className="hover:text-gray-700 transition" to="/">Home</Link></li>
              <li><Link className="hover:text-gray-700 transition" to="/cars">Browse Cars</Link></li>
              <li><Link className="hover:text-gray-700 transition" to="/owner/add-car">List Your Car</Link></li>
              <li><Link className="hover:text-gray-700 transition" to="/about">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
              Resources
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              <li><Link className="hover:text-gray-700 transition" to="/help-center">Help Center</Link></li>
              <li><Link className="hover:text-gray-700 transition" to="/terms">Terms of Service</Link></li>
              <li><Link className="hover:text-gray-700 transition" to="/privacy">Privacy Policy</Link></li>
              <li><Link className="hover:text-gray-700 transition" to="/insurance">Insurance</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
              Contact
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              <li><a className="hover:text-gray-700 transition" href="https://www.google.com/maps?q=1234+Luxury+Drive,+San+Francisco,+CA+94107" target="_blank" rel="noreferrer">1234 Luxury Drive</a></li>
              <li><Link className="hover:text-gray-700 transition" to="/contact">San Francisco, CA 94107</Link></li>
              <li><a className="hover:text-gray-700 transition" href="tel:+1234567890">+1 234 567890</a></li>
              <li><a className="hover:text-gray-700 transition" href="mailto:mepersonalfiroz@gmail.com">mepersonalfiroz@gmail.com</a></li>
            </ul>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        {...fadeUp(0.5)}
        className="flex flex-col md:flex-row gap-3 items-center justify-between py-6 text-gray-600"
      >
        <p>© {new Date().getFullYear()} DriveVault. All rights reserved.</p>

        <ul className="flex items-center gap-4">
          {["Privacy", "Terms", "Cookies"].map((item, i) => (
            <React.Fragment key={item}>
              <li>
                <Link className="hover:text-gray-800 transition" to={
                  item === 'Privacy' ? '/privacy' : item === 'Terms' ? '/terms' : '/cookies'
                }>
                  {item}
                </Link>
              </li>
              {i < 2 && <span>|</span>}
            </React.Fragment>
          ))}
        </ul>
      </motion.div>
    </footer>
  );
};

export default Footer;
