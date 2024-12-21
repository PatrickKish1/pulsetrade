import { truncateAddress } from "@/lib/utils/lib-utils";
import React from "react";


interface TransactionLinkProps {
  hash: string;
  blockExplorerUrl: string;
}

const TxNotification: React.FC<TransactionLinkProps> = ({
  hash,
  blockExplorerUrl,
}) => {
  const explorerUrl = `${blockExplorerUrl}/tx/${hash}`;

  return (
    <div className="mt-4 p-4 border border-purple-500 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-white">
        Transaction Successful!
      </h3>
      <p className="text-white">
        Explorer:{" "}
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline break-words"
        >
          {truncateAddress(hash)}
        </a>
      </p>
    </div>
  );
};

export default TxNotification;
