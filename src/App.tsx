import './App.css';
import React, { useState } from 'react';
import {
  Button,
  Typography,
  Container,
  Grid,
  Stack,
  IconButton,
  Card,
  Tooltip, CardContent,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SendIcon from '@mui/icons-material/Send';

const acceptableFilName = ['csv'];

const checkFileName = (name: string) => {
  const extension = name.split('.').pop();
  if (!extension) {
    return false;
  }
  return acceptableFilName.includes(extension.toLowerCase());
};

export const Status = {
  uninstantiated: 'uninstantiated',
  fileReceived: 'fileReceived',
  processing: 'processing',
  fileReady: 'fileReady',
  error: 'error',
};

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadLink, setDownloadLink] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>(Status.uninstantiated);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const myFile = event.target.files[0];

      if (!myFile) return;

      if (!checkFileName(myFile.name)) {
        alert('Invalid File type!');
        return;
      }
      setSelectedFile(myFile);
      setUploadStatus(Status.fileReceived);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setUploadStatus(Status.processing);
      const formData = new FormData();
      formData.append('file', selectedFile);
      console.log(selectedFile)

      try {
        const response = await axios.post('https://drips-logs-processing-server-6c4069d1815a.herokuapp.com/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
        });

        console.log(response)

        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        setDownloadLink(url);
        setUploadStatus(Status.fileReady);
      }
      catch (error) {
        console.error('Error uploading the file:', error);
        setUploadStatus('error');
      }
    }
  };

  const handleRemove = () => {
    if (selectedFile) {
      setSelectedFile(null);
      setUploadStatus(Status.uninstantiated);
    }
  };

  return (
      <Container maxWidth='md'>
        <Grid container justifyContent='center' alignItems='center' style={{ minHeight: '100vh' }}>
          <Card sx={{ bgcolor: '#daebf2', borderRadius: 2, minHeight: 300, minWidth: 500, boxShadow: 3}}>
            <CardContent>
              <Typography variant='h5' gutterBottom sx={{marginBottom: 3}}>
                Excel File Upload and Download
              </Typography>

              {/* The upload and download element */}
              <Stack spacing={4}>
                  {/* The button to upload the file */}
                  <Stack direction='row' spacing={2}>
                    <label htmlFor='file'>
                      <Button
                          variant='contained'
                          component='span'
                          startIcon={<CloudUploadIcon />}
                      >
                        Upload Excel File
                      </Button>
                      <input
                          type='file'
                          accept='csv'
                          id='file'
                          multiple={false}
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileChange(e)}
                      />
                    </label>
                    <IconButton
                        color='primary'
                        aria-label='send'
                        onClick={handleUpload}
                        disabled={!selectedFile || uploadStatus === Status.processing}

                        style={{ borderRadius: '50%' }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Stack>

              {/* The file name */}
              {selectedFile && (<Stack direction='row'>
                <Tooltip title={selectedFile.name}>
                  <Typography variant='subtitle1' sx={{ maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFile.name}
                  </Typography>
                </Tooltip>

                <IconButton size='small' onClick={handleRemove}>
                  <CloseIcon sx={{ fontSize: 'inherit' }} />
                </IconButton>
              </Stack>)}

              {/* The button to download the file */}
              <Stack direction='row' spacing={2}>
                <Button
                    variant='contained'
                    color='secondary'
                    href={downloadLink}
                    disabled={uploadStatus !== 'fileReady'}
                    startIcon={<CloudDownloadIcon />}

                    download='processed_file.xlsx'
                >
                   Download Processed File
                </Button>
                {uploadStatus === 'processing' && (
                    <HourglassEmptyIcon color='info' />
                )}
                {uploadStatus === 'fileReady' && (
                    <CheckCircleIcon color='success' />
                )}
                {uploadStatus === 'error' && (
                    <ErrorIcon color='error' />
                )}
              </Stack>

              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Container>
  );
}

export default App;
