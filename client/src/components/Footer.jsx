import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-col md:flex-row items-start justify-around gap-10 py-10 border-y border-gray-500/30 text-gray-500">
        {/* Left Side */}
        <div>
          <div className="flex items-center gap-2 cursor-pointer shrink-0">
            <img src={assets.logo} className="w-8 sm:w-11" />
            <span className="text-lg sm:text-3xl font-bold text-black">
              EpicBloggy
            </span>
          </div>

          <p className="max-w-md mt-6">
            EpicBloggy is a creative platform for sharing inspiring stories and insights on travel, lifestyle, culture, and technology.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-start w-full md:w-auto">
          <h3 className="font-semibold  text-lg text-gray-900 mb-3">
            Follow Us
          </h3>

          <div className="flex gap-5 text-base [&>a]:transition [&>a]:duration-300 [&>a:hover]:text-black">
            <a href="#">GitHub</a>
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-sm md:text-base text-gray-500/80">
        Copyright 2026 © Pushparaj Chaudhary - All Right Reserved
      </p>
    </div>
  );
};

export default Footer;
