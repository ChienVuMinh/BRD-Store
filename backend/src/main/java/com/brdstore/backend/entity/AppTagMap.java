package com.brdstore.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "app_tag_map")
@Getter
@Setter
public class AppTagMap {

    @EmbeddedId
    private Id id = new Id();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("appId")
    @JoinColumn(name = "app_id")
    private App app;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tagId")
    @JoinColumn(name = "tag_id")
    private Tag tag;

    @Embeddable
    @Getter
    @Setter
    public static class Id implements Serializable {
        @Column(name = "app_id")
        private UUID appId;

        @Column(name = "tag_id")
        private Integer tagId;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Id id)) return false;
            return Objects.equals(appId, id.appId) && Objects.equals(tagId, id.tagId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(appId, tagId);
        }
    }
}
