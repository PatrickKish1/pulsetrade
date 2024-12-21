import Image from "next/image";

// Link to repository
const repositoryLink = {
  href: "https://github.com/soos3d/particle-auth-nextjs-aa",
  imgSrc: "/logo.png",
  imgAlt: "GitHub Logo",
  text: "Check the repository",
};

// Indicate where the bulk of the code is
const codeText = {
  text: "Get started by editing",
  code: "src/app/page.tsx",
};

// Links and descriptions to the particle documentation
const links = [
  {
    href: "https://developers.particle.network",
    title: "Documentation →",
    description: "Find in-depth information about AuthCore features and API.",
  },
  {
    href: "https://dashboard.particle.network",
    title: "Dashboard →",
    description:
      "Manage your projects and team, View analytics data, Custom configuration.",
  },
  {
    href: "https://github.com/Particle-Network/particle-web-auth-core",
    title: "Examples →",
    description: "Discover and deploy boilerplate example AuthCore projects.",
  },
  {
    href: "https://particle.network",
    title: "Particle Network →",
    description: "The L1 unifying all chains through Universal Accounts.",
  },
];

// UI component
const LinksGrid = () => {
  return (
    <>
      <h2 className="text-2xl font-bold mt-8 mb-6 text-center">
        <a
          href={repositoryLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-purple-300 transition duration-300 flex items-center"
        >
          <Image
            src={repositoryLink.imgSrc}
            width={800}
            height={800}
            alt={repositoryLink.imgAlt}
            className="w-6 h-6 mr-2"
          />
          {repositoryLink.text}
        </a>
      </h2>
      <p className="text-xl mb-12 text-center">
        {codeText.text}{" "}
        <code className="bg-gray-800 rounded p-1 text-purple-300">
          {codeText.code}
        </code>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-purple-500 p-6 rounded-lg hover:bg-gray-800 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <h2 className="text-2xl font-semibold mb-2 text-purple-400">
              {link.title}
            </h2>
            <p className="text-gray-300">{link.description}</p>
          </a>
        ))}
      </div>
      <footer className="w-full flex justify-center items-center py-8">
        <Image src="/dark.png" alt="Particle Logo" width={240} height={24} />
      </footer>
    </>
  );
};

export default LinksGrid;
