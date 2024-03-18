import React from 'react'
import logo from "../public/images/logo.png"
import { FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";

const Footer = () => {
  return (
   
<footer className="w-full bg-gray-100 py-6 font-bold">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center justify-center">
        {/* First column */}
        <div className="mb-4 md:mb-0">
        <a href="https://avocado.instadapp.io/" target='_blank' className="text-gray-600 hover:text-gray-900">
          <Image src={logo} alt="Logo" width={100} height={100} />
          </a>
        </div>
        {/* Second column */}
        <div className="mb-4 md:mb-0">
          <ul className="flex space-x-4">
            <li>
              <a href="https://docs.avocado.instadapp.io/" target='_blank' className="text-gray-600 hover:text-gray-900">
                Docs
              </a>
            </li>
            <li>
              <a href="https://docs.avocado.instadapp.io/integrate/avocado-network" target='_blank' className="text-gray-600 hover:text-gray-900">
                Avocado RPC
              </a>
            </li>
            
          </ul>
        </div>
        {/* Third column */}
        <div>
  <ul className="flex flex-col items-right">
    <li>
      <a href="https://twitter.com/avowallet" target='_blank' className="text-gray-600 hover:text-gray-900">
        <FaXTwitter className="inline-block mr-2" /> Twitter / X
      </a>
    </li>
    <li>
      <a href="https://discord.gg/83vvrnY" target='_blank' className="text-gray-600 hover:text-gray-900">
        <FaDiscord className="inline-block mr-2" /> Discord
      </a>
    </li>
  </ul>
</div>
      </div>
    </div>
  </footer>
  )
}

export default Footer
