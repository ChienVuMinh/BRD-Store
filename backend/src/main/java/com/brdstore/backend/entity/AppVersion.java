package com.brdstore.backend.entity;

import com.brdstore.backend.entity.enums.VersionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "app_versions")
@Getter
@Setter
public class AppVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;

    @Column(name = "version_name", nullable = false, length = 100)
    private String versionName;

    @Column(name = "build_number", nullable = false)
    private Long buildNumber;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "file_hash_sha256")
    private String fileHashSha256;

    @Column(name = "min_sdk_version", length = 50)
    private String minSdkVersion;

    @Column(name = "target_sdk_version", length = 50)
    private String targetSdkVersion;

    @Column(name = "supported_architectures", length = 100)
    private String supportedArchitectures;

    @Column(name = "release_notes", columnDefinition = "TEXT")
    private String releaseNotes;

    @Column(name = "scheduled_release_date")
    private OffsetDateTime scheduledReleaseDate;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "version_status_enum")
    private VersionStatus status = VersionStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
