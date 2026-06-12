<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AntiVpnService
{
    /**
     * Memeriksa apakah sebuah IP Address terdeteksi sebagai VPN/Proxy.
     * Menggunakan Proxycheck.io API.
     *
     * @param string $ipAddress IP klien yang akan dicek.
     * @return array Array berisi informasi deteksi dan metadata keamanan.
     */
    public function checkIp(string $ipAddress): array
    {
        $failMode = env('ANTI_VPN_FAIL_MODE', 'allow');
        $apiKey = env('PROXYCHECK_API_KEY', '');
        
        $defaultResult = [
            'is_blocked'       => false,
            'vpn_detected'     => false,
            'proxy_detected'   => false,
            'tor_detected'     => false,
            'hosting_detected' => false,
            'risk_score'       => 0,
            'provider_name'    => 'proxycheck',
            'reason'           => null,
            'error'            => false,
        ];

        // IP lokal biasanya IPv4 private atau IPv6 localhost, lewati pengecekan
        if ($this->isPrivateIp($ipAddress)) {
            $defaultResult['reason'] = 'Local/Private IP Skipped';
            return $defaultResult;
        }

        try {
            $url = "http://proxycheck.io/v2/{$ipAddress}?vpn=1&asn=1&risk=1";
            if (!empty($apiKey)) {
                $url .= "&key={$apiKey}";
            }

            $response = Http::timeout(5)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['status']) && $data['status'] === 'ok' && isset($data[$ipAddress])) {
                    $ipData = $data[$ipAddress];

                    $isProxy = isset($ipData['proxy']) && $ipData['proxy'] === 'yes';
                    $type = strtolower($ipData['type'] ?? '');
                    
                    $vpnDetected = $isProxy && str_contains($type, 'vpn');
                    $torDetected = $isProxy && str_contains($type, 'tor');
                    $hostingDetected = $isProxy && str_contains($type, 'hosting');
                    // Jika proxy yes tapi tidak tahu persis tipe, set proxy_detected
                    $proxyDetected = $isProxy; 
                    
                    $riskScore = isset($ipData['risk']) ? (int) $ipData['risk'] : 0;

                    return [
                        'is_blocked'       => $isProxy,
                        'vpn_detected'     => $vpnDetected,
                        'proxy_detected'   => $proxyDetected,
                        'tor_detected'     => $torDetected,
                        'hosting_detected' => $hostingDetected,
                        'risk_score'       => $riskScore,
                        'provider_name'    => 'proxycheck',
                        'reason'           => $isProxy ? 'IP terdeteksi sebagai ' . strtoupper($type) : null,
                        'error'            => false,
                    ];
                } else if (isset($data['status']) && $data['status'] === 'error') {
                    // Terjadi error limit API dll
                    Log::warning("AntiVpnService API Error: " . ($data['message'] ?? 'Unknown Error'));
                    $defaultResult['error'] = true;
                    $defaultResult['reason'] = 'API Proxycheck Error';
                }
            } else {
                Log::warning("AntiVpnService HTTP Error: " . $response->status());
                $defaultResult['error'] = true;
                $defaultResult['reason'] = 'HTTP Request Failed';
            }
        } catch (\Exception $e) {
            Log::error("AntiVpnService Exception: " . $e->getMessage());
            $defaultResult['error'] = true;
            $defaultResult['reason'] = 'Connection Exception';
        }

        // Jika terjadi error dan fail mode adalah block, maka blokir
        if ($defaultResult['error'] && $failMode === 'block') {
            $defaultResult['is_blocked'] = true;
            $defaultResult['reason'] = 'API Provider Error & FAIL_MODE is Block';
        }

        return $defaultResult;
    }

    private function isPrivateIp($ip)
    {
        return !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
    }
}
