package com.brdstore.backend.scheduler;

import com.brdstore.backend.entity.App;
import com.brdstore.backend.entity.AppStats;
import com.brdstore.backend.repository.AppInstallRepository;
import com.brdstore.backend.repository.AppRepository;
import com.brdstore.backend.repository.AppReviewRepository;
import com.brdstore.backend.repository.AppStatsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;

@Component
public class AppStatsScheduler {

    private static final Logger log = LoggerFactory.getLogger(AppStatsScheduler.class);

    private final AppRepository appRepository;
    private final AppStatsRepository appStatsRepository;
    private final AppInstallRepository installRepository;
    private final AppReviewRepository reviewRepository;

    public AppStatsScheduler(AppRepository appRepository, AppStatsRepository appStatsRepository,
                              AppInstallRepository installRepository, AppReviewRepository reviewRepository) {
        this.appRepository = appRepository;
        this.appStatsRepository = appStatsRepository;
        this.installRepository = installRepository;
        this.reviewRepository = reviewRepository;
    }

    @Scheduled(fixedDelayString = "${app.stats.recalc-interval-ms:300000}")
    @Transactional
    public void recalculate() {
        for (App app : appRepository.findAll()) {
            AppStats stats = appStatsRepository.findById(app.getId()).orElseGet(() -> {
                AppStats s = new AppStats();
                s.setApp(app);
                s.setAppId(app.getId());
                return s;
            });
            stats.setTotalDownloads(installRepository.countByAppId(app.getId()));
            BigDecimal avg = reviewRepository.averageRating(app.getId());
            stats.setAverageRating(avg != null ? avg.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            stats.setTotalReviews((int) reviewRepository.countByAppIdAndIsHiddenFalse(app.getId()));
            stats.setUpdatedAt(OffsetDateTime.now());
            appStatsRepository.save(stats);
        }
        log.debug("app_stats recalculated for {} apps", appRepository.count());
    }
}
