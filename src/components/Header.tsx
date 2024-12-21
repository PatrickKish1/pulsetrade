'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton, useAccount } from '@particle-network/connectkit';
import MaxWidthWrapper from './MaxWidthWrapper';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected } = useAccount();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/tutorials', label: 'Tutorials' },
    { href: '/chats', label: 'Chats' },
    { href: '/ai-chats', label: 'AI Chat' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm supports-[backdrop-filter]:bg-inherit">
      <MaxWidthWrapper>
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50">
            <Image 
              src="/logo.png" 
              alt="Pulse Trade Logo" 
              width={50} 
              height={50} 
              className="h-10 w-10"
              priority
            />
            <span className="text-xl font-bold text-purple-600">Pulse Trade</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <div className="rounded-md backdrop-blur-md bg-white/30 px-3 py-1.5 shadow-sm border border-white/50">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-base font-medium text-gray-700 rounded-md hover:text-purple-600 hover:bg-gray-200 transition-all duration-200 group"
                >
                  {link.label}
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-purple-500/0 via-purple-500/70 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </nav>

          {/* Connect Wallet Button / Connected State */}
          <div className="hidden md:block">
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    Connected <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <ConnectButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <ConnectButton label="Connect Wallet" />
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            className="md:hidden p-2 rounded-full hover:bg-white/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </Button>

          {/* Mobile Menu Overlay */}
          <div
            className={cn(
              "fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden",
              isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div
            className={cn(
              "absolute top-0 right-0 h-screen w-64 bg-white/80 backdrop-blur-lg shadow-xl transform transition-transform duration-300 ease-in-out md:hidden",
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="flex flex-col h-full pt-20 pb-6 px-4">
              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="text-gray-700 hover:text-purple-600 hover:bg-white/50 px-4 py-2 rounded-full transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Connect Wallet Button */}
              <div className="mt-auto">
                {isConnected ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full rounded-full">
                        Connected <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <ConnectButton />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <ConnectButton label="Connect Wallet" />
                )}
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
};

export default Header;