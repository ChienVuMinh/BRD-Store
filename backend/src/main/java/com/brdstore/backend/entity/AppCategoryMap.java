package com.brdstore.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "app_category_map")
@Getter
@Setter
public class AppCategoryMap {

    @EmbeddedId
    private Id id = new Id();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("appId")
    @JoinColumn(name = "app_id")
    private App app;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("categoryId")
    @JoinColumn(name = "category_id")
    private AppCategory category;

    @Embeddable
    @Getter
    @Setter
    public static class Id implements Serializable {
        @Column(name = "app_id")
        private UUID appId;

        @Column(name = "category_id")
        private Integer categoryId;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Id id)) return false;
            return Objects.equals(appId, id.appId) && Objects.equals(categoryId, id.categoryId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(appId, categoryId);
        }
    }
}
