import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col bg-white items-center justify-center h-screen">
      <Image src={"/logo.png"} alt={"Logo"} width={400} height={400} />
      <h1 className="text-7xl text-blue-950 font-bold mb-40 mt-[-80]">Welcome to PULSE TRADE </h1>
    </div>
  );
}
