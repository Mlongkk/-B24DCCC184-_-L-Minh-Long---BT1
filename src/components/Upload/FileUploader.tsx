import React from 'react';
import { Upload, UploadProps, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

interface FileUploaderProps {
    onUpload: (file: File) => Promise<void>;
    accept?: string;
    maxSize?: number; // in bytes
    maxFiles?: number;
    children?: React.ReactNode;
}

const FileUploader: React.FC<FileUploaderProps> = ({
    onUpload,
    accept = 'image/*',
    maxSize = 5242880, // 5MB default
    maxFiles = 1,
    children,
}) => {
    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        // Check file size
        if (file.size > maxSize) {
            message.error(`File không được vượt quá ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
            return Upload.LIST_IGNORE;
        }

        // Upload file
        onUpload(file)
            .then(() => {
                message.success('Tải lên thành công');
            })
            .catch((error) => {
                message.error('Lỗi khi tải lên');
                console.error(error);
            });

        return false; // Prevent default upload behavior
    };

    return (
        <Upload.Dragger
            name="file"
            beforeUpload={beforeUpload}
            accept={accept}
            multiple={false}
            showUploadList={false}
        >
            {children || (
                <>
                    <InboxOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                    <p style={{ color: '#000' }}>Kéo thả tệp tại đây hoặc nhấp để chọn</p>
                    <p style={{ color: '#999', fontSize: 12 }}>
                        Kích thước tối đa: {(maxSize / 1024 / 1024).toFixed(2)}MB
                    </p>
                </>
            )}
        </Upload.Dragger>
    );
};

export default FileUploader;
