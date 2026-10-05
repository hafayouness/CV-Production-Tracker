import { Download } from "lucide-react";
import { downloadUrl } from "../services/excelApi";

export default function DownloadButton({ filename }: { filename: string }) {
  return (
    <a href={downloadUrl(filename)} className="btn btn-ok">
      <Download size={16} />
      Télécharger {filename}
    </a>
  );
}
