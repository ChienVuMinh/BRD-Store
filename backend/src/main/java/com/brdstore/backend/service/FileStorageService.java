package com.brdstore.backend.service;

import com.brdstore.backend.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root;

    public FileStorageService(@Value("${app.uploads.dir}") String uploadsDir) {
        this.root = Path.of(uploadsDir).toAbsolutePath();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create uploads directory", e);
        }
    }

    public StoredFile store(MultipartFile file, String subDir) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("File is empty");
        }
        try {
            Path targetDir = root.resolve(subDir);
            Files.createDirectories(targetDir);
            String extension = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) {
                extension = original.substring(original.lastIndexOf('.'));
            }
            String storedName = UUID.randomUUID() + extension;
            Path targetPath = targetDir.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String sha256 = sha256(targetPath);
            String publicUrl = "/uploads/" + subDir + "/" + storedName;
            return new StoredFile(publicUrl, Files.size(targetPath), sha256);
        } catch (IOException e) {
            throw new ApiException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file: " + e.getMessage());
        }
    }

    private String sha256(Path path) throws IOException {
        try (InputStream is = Files.newInputStream(path)) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int read;
            while ((read = is.read(buffer)) != -1) {
                digest.update(buffer, 0, read);
            }
            byte[] hash = digest.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public record StoredFile(String url, long sizeBytes, String sha256) {
    }
}
