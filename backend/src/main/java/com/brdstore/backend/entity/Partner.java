package com.brdstore.backend.entity;

import com.brdstore.backend.entity.enums.PartnerStatus;
import com.brdstore.backend.entity.enums.PartnerType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "partners")
@Getter
@Setter
public class Partner {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "partner_code", unique = true, nullable = false, length = 50)
    private String partnerCode;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "partner_type", columnDefinition = "partner_type_enum", nullable = false)
    private PartnerType partnerType;

    @Column(nullable = false)
    private String name;

    @Column(name = "tax_id", length = 50)
    private String taxId;

    @Column(name = "legal_rep_name", nullable = false)
    private String legalRepName;

    @Column(name = "legal_rep_phone", length = 20)
    private String legalRepPhone;

    @Column(nullable = false)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_code")
    private Geography province;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_code")
    private Geography district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_code")
    private Geography ward;

    @Column(name = "address_detail", columnDefinition = "TEXT")
    private String addressDetail;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "legal_document_url", columnDefinition = "TEXT")
    private String legalDocumentUrl;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_branch")
    private String bankBranch;

    @Column(name = "bank_account_no", length = 100)
    private String bankAccountNo;

    @Column(name = "bank_account_name")
    private String bankAccountName;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "partner_status_enum")
    private PartnerStatus status = PartnerStatus.PENDING;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
