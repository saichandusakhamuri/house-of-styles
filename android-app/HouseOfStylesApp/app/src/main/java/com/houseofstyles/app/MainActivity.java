package com.houseofstyles.app;

import android.annotation.SuppressLint;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.houseofstyles.app.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity {
    private static final String LOCAL_HOME = "file:///android_asset/www/index.html";

    private ActivityMainBinding binding;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        WebView webView = binding.webView;
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new LocalSiteClient());

        binding.swipeRefresh.setOnRefreshListener(webView::reload);
        webView.loadUrl(LOCAL_HOME);
    }

    @Override
    public void onBackPressed() {
        if (binding.webView.canGoBack()) {
            binding.webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private class LocalSiteClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(@NonNull WebView view, @NonNull WebResourceRequest request) {
            Uri uri = request.getUrl();
            String url = uri.toString();

            if (url.startsWith("file:///android_asset/")) {
                return false;
            }

            if (!url.startsWith("http")) {
                view.loadUrl("file:///android_asset/www/" + uri.getLastPathSegment());
                return true;
            }

            return false;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            binding.swipeRefresh.setRefreshing(false);
        }
    }
}
