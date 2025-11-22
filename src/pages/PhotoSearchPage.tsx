import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import PhotoSearch from "@/components/PhotoSearch";
import { useState } from "react";

const PhotoSearchPage = () => {
  const [activeSection, setActiveSection] = useState("search");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <PhotoSearch />
      </main>
      <Footer />
    </div>
  );
};

export default PhotoSearchPage;
