package com.brdstore.backend.entity;

import com.brdstore.backend.entity.enums.AppPriceType;
import com.brdstore.backend.entity.enums.AppStatus;
import com.brdstore.backend.entity.enums.OsPlatform;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "apps")
@Getter
@Setter
public class App {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "os_platform", columnDefinition = "os_platform_enum", nullable = false)
    private OsPlatform osPlatform;

    @Column(name = "package_name", nullable = false)
    private String packageName;

    @Column(nullable = false)
    private String name;

    @Column(name = "short_desc")
    private String shortDesc;

    @Column(name = "full_desc", columnDefinition = "TEXT")
    private String fullDesc;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "banner_url", columnDefinition = "TEXT")
    private String bannerUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_rating_id")
    private ContentRating contentRating;

    @Column(name = "support_email")
    private String supportEmail;

    @Column(name = "support_phone", length = 20)
    private String supportPhone;

    @Column(name = "website_url", columnDefinition = "TEXT")
    private String websiteUrl;

    @Column(name = "privacy_policy_url", columnDefinition = "TEXT")
    private String privacyPolicyUrl;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "price_type", columnDefinition = "app_price_type_enum")
    private AppPriceType priceType = AppPriceType.FREE;

    @Column(name = "price_vnd", precision = 12, scale = 2)
    private BigDecimal priceVnd = BigDecimal.ZERO;

    @Column(name = "app_signature_hash")
    private String appSignatureHash;

    @Column(name = "is_global_access")
    private Boolean isGlobalAccess = true;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "app_status_enum")
    private AppStatus status = AppStatus.DRAFT;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
