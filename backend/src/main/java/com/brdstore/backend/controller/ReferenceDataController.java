package com.brdstore.backend.controller;

import com.brdstore.backend.entity.AppCategory;
import com.brdstore.backend.entity.AppPermission;
import com.brdstore.backend.entity.ContentRating;
import com.brdstore.backend.entity.Geography;
import com.brdstore.backend.entity.Tag;
import com.brdstore.backend.repository.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reference")
public class ReferenceDataController {

    private final AppCategoryRepository categoryRepository;
    private final ContentRatingRepository contentRatingRepository;
    private final TagRepository tagRepository;
    private final GeographyRepository geographyRepository;
    private final AppPermissionRepository permissionRepository;

    public ReferenceDataController(AppCategoryRepository categoryRepository, ContentRatingRepository contentRatingRepository,
                                    TagRepository tagRepository, GeographyRepository geographyRepository,
                                    AppPermissionRepository permissionRepository) {
        this.categoryRepository = categoryRepository;
        this.contentRatingRepository = contentRatingRepository;
        this.tagRepository = tagRepository;
        this.geographyRepository = geographyRepository;
        this.permissionRepository = permissionRepository;
    }

    @GetMapping("/categories")
    public List<AppCategory> categories() {
        return categoryRepository.findAll();
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('S_ADMIN','O_ADMIN')")
    public AppCategory createCategory(@RequestBody AppCategory category) {
        category.setId(null);
        return categoryRepository.save(category);
    }

    @GetMapping("/content-ratings")
    public List<ContentRating> contentRatings() {
        return contentRatingRepository.findAll();
    }

    @GetMapping("/tags")
    public List<Tag> tags() {
        return tagRepository.findAll();
    }

    @GetMapping("/geographies")
    public List<Geography> geographies() {
        return geographyRepository.findAll();
    }

    @GetMapping("/permissions")
    public List<AppPermission> permissions() {
        return permissionRepository.findAll();
    }
}
