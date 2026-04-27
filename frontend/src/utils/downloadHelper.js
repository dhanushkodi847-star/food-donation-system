import API from '../api/axios';

export const downloadPDF = async (url, fileName) => {
  try {
    const response = await API.get(url, {
      responseType: 'blob',
    });
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download PDF. Please check your permissions.');
  }
};
