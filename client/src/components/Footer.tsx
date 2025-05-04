'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Text from './Text';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold mb-4 text-gray-800 dark:text-white">Iwanyu</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Text id="footerTagline">Your premier marketplace for Rwandan products and vendors.</Text>
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-bold mb-4 text-gray-800 dark:text-white">
              <Text id="quickLinks">Quick Links</Text>
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                  <Text id="aboutUs">About Us</Text>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                  <Text id="contactUs">Contact</Text>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                  <Text id="faq">FAQ</Text>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                  <Text id="vendorPricing">Vendor Pricing</Text>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4 text-gray-800 dark:text-white">
              <Text id="legal">Legal</Text>
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                  <Text id="termsOfService">Terms of Service</Text>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                  <Text id="privacyPolicy">Privacy Policy</Text>
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                  <Text id="shippingPolicy">Shipping Policy</Text>
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                  <Text id="returnsRefunds">Returns & Refunds</Text>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4 text-gray-800 dark:text-white">
              <Text id="contactUs">Contact Us</Text>
            </h5>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FaMapMarkerAlt className="mr-2 text-yellow-600 dark:text-yellow-400" />
                <span><Text id="address">Kigali, Rwanda</Text></span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FaPhone className="mr-2 text-yellow-600 dark:text-yellow-400" />
                <span>+250 78 123 4567</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FaEnvelope className="mr-2 text-yellow-600 dark:text-yellow-400" />
                <span>info@iwanyu.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Iwanyu. <Text id="allRightsReserved">All rights reserved.</Text>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            <Text id="designedFor">Designed and developed for the Rwandan market.</Text>
          </p>
        </div>
      </div>
    </footer>
  );
}
