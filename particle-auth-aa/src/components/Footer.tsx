'use client'
import React from 'react';
import Link from 'next/link';
import MaxWidthWrapper from './MaxWidthWrapper';
import Image from 'next/image';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';

const Footer = () => {
  return (
    <div className="w-full overflow-hidden">
      {/* Wave Animation */}
      <div className="relative w-full">
        <svg 
          className="w-full h-[100px] min-h-[60px] max-h-[150px] -mb-[7px] md:h-[60px]"
          xmlns="http://www.w3.org/2000/svg" 
          xmlnsXlink="http://www.w3.org/1999/xlink" 
          viewBox="0 24 150 28" 
          preserveAspectRatio="none" 
          shapeRendering="auto"
        >
          <defs>
            <path 
              id="gentle-wave" 
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="animate-wave-parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" className="fill-[#ff00ff]/20" />
            <use xlinkHref="#gentle-wave" x="48" y="3" className="fill-[#00ffff]/30" />
            <use xlinkHref="#gentle-wave" x="48" y="5" className="fill-[#c1a4d0]" />
            <use xlinkHref="#gentle-wave" x="48" y="7" className="fill-[#1e1443]" />
        </g>
        </svg>
      </div>

      {/* Footer Content */}
      <footer className="bg-[#1e1443] text-gray-300 pt-5">
        <div className="container mx-auto px-4">
          <MaxWidthWrapper>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="md:col-span-8">
              <Image width={100} height={100} src={'/logo.png'} alt='Footer Logo'/>
              <p className="mb-0">COPYRIGHT 2024 <span className="uppercase">Your Name</span></p>
              <p className="text-sm">
                This work is licensed under a <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="text-white hover:text-gray-200">Creative Commons Attribution 4.0 International License</a>.
                <br /> Made with <i className="fas fa-heart text-purple-600"></i> and lots of <i className="fas fa-mug-hot text-[#6f4e37]"></i>
              </p>
              <p className="mb-0 text-sm">DISCLAIMER</p>
              <p className="mb-0 text-sm">Opinions expressed here are my own.</p>
            </div>

            {/* Right Column */}
            <div className="md:col-span-4 mt-4 md:mt-0 md:pl-0">
              <p className="text-center md:text-left text-sm">Powered by Next.js</p>
              <div className="flex justify-center md:justify-start space-x-6 mb-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter text-2xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-github-alt text-2xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-linkedin text-2xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="far fa-envelope text-2xl"></i>
                </a>
              </div>

              {/* Search Form */}
              <div className="mt-4">
                <form method="get" action="/search" className="flex">
                  <Input
                    name="term"
                    className="flex-1 p-2 w-8 sm:w-full bg-white border-0 text-gray-800 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="search"
                    placeholder="Search the site"
                    required
                  />
                  <Button type="submit" className="px-4 ml-12 bg-gray-700 text-white rounded-r hover:bg-gray-600 transition-colors">
                    <i className="fas fa-search"><Search /></i>
                  </Button>
                </form>
              </div>
            </div>
          </div>
          </MaxWidthWrapper>
          
        </div>

        {/* Bottom Links */}
        <div className="mt-8 py-3 bg-[#1e1443]">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center space-x-4 text-sm text-gray-400">
              <Link href="/sitemap.xml" className="hover:text-white transition-colors">
                <i className="fas fa-sitemap mr-1"></i>
                Sitemap
              </Link>
              <span>/</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                <i className="far fa-question-circle mr-1"></i>
                Privacy policy
              </Link>
              <span>/</span>
              <button className="hover:text-white transition-colors">
                <i className="fas fa-cookie-bite mr-1"></i>
                Revoke Consent
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;