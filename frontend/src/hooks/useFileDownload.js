import axios from "axios";

function useFileDownload(data, fileName) {
    const blob = new Blob([data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();   
    link.remove();
    
    window.URL.revokeObjectURL(url);
}

export default useFileDownload;