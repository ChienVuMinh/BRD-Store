package com.brdstore.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "content_ratings")
@Getter
@Setter
public class ContentRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 10)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;
}
