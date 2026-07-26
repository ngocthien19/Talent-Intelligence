import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useLanguage } from '~/hooks/useLanguage'
import { analyticsApi } from '~/api/hr/analytics.api'

import AnalyticsHeader from '~/components/hr/analytics/AnalyticsHeader'
import AnalyticsTable from '~/components/hr/analytics/AnalyticsTable'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const Analytics = () => {
  const { t } = useLanguage()
  const [candidates, setCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [enrichingId, setEnrichingId] = useState(null)
  const [sendingId, setSendingId] = useState(null)
  const [analyzedIds, setAnalyzedIds] = useState([])
  const [enrichedIds, setEnrichedIds] = useState([])
  const [sentIds, setSentIds] = useState([])

  // Fetch candidates chưa phân tích
  const fetchCandidates = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await analyticsApi.getUnanalyzedCandidates({
        limit: 100,
        page: 1
      })
      if (response.success) {
        setCandidates(response.data || [])
        // Load trạng thái cho từng candidate
        await loadAllStatuses(response.data || [])
      } else {
        toast.error(response.message || 'Không thể tải danh sách ứng viên')
      }
    } catch (error) {
      console.error('Fetch candidates error:', error)
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load trạng thái cho tất cả candidates
  const loadAllStatuses = async (candidatesList) => {
    const analyzed = []
    const enriched = []
    const sent = []

    for (const candidate of candidatesList) {
      try {
        // Check analysis
        const analysisRes = await analyticsApi.getAnalysisResult(candidate.id)
        if (analysisRes.success && analysisRes.data) {
          analyzed.push(candidate.id)
        }

        // Check enrichment
        const enrichRes = await analyticsApi.getEnrichment(candidate.id)
        if (enrichRes.success && enrichRes.data) {
          enriched.push(candidate.id)
        }

        // Check report sent
        const reportRes = await analyticsApi.checkReportSent(candidate.id)
        if (reportRes.success && reportRes.data?.is_notified) {
          sent.push(candidate.id)
        }
      } catch (error) {
        // Ignore errors
      }
    }

    setAnalyzedIds(analyzed)
    setEnrichedIds(enriched)
    setSentIds(sent)
  }

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Polling để cập nhật trạng thái sau khi phân tích
  const pollAnalysisResult = async (applicationId, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      try {
        const response = await analyticsApi.getAnalysisResult(applicationId)
        if (response.success && response.data) {
          setAnalyzedIds(prev => [...prev, applicationId])
          toast.success(t('hr.analytics.analyzeSuccess') || 'Phân tích hoàn tất!')
          return true
        }
      } catch (error) {
        // Chưa có kết quả
      }
    }
    toast.warning(t('hr.analytics.analyzeTimeout') || 'Phân tích đang được xử lý. Vui lòng kiểm tra lại sau.')
    return false
  }

  const handleAnalyze = async (applicationId) => {
    setAnalyzingId(applicationId)
    try {
      const response = await analyticsApi.analyzeCandidate(applicationId)
      if (response.success) {
        toast.success(response.message || 'Đã bắt đầu phân tích CV')
        await pollAnalysisResult(applicationId)
        // Sau khi phân tích xong, kiểm tra enrichment và report
        await loadAllStatuses(candidates)
      } else {
        toast.error(response.message || 'Phân tích thất bại')
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setAnalyzingId(null)
    }
  }

  const handleEnrich = async (applicationId) => {
    setEnrichingId(applicationId)
    try {
      const response = await analyticsApi.enrichResume(applicationId)
      if (response.success) {
        toast.success(response.message || 'Phân tích nâng cao thành công')
        setEnrichedIds(prev => [...prev, applicationId])
        await loadAllStatuses(candidates)
      } else {
        toast.error(response.message || 'Phân tích nâng cao thất bại')
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setEnrichingId(null)
    }
  }

  const handleSendReport = async (applicationId) => {
    setSendingId(applicationId)
    try {
      const response = await analyticsApi.sendReport(applicationId)
      if (response.success) {
        toast.success(response.message || 'Đã gửi báo cáo thành công')
        setSentIds(prev => [...prev, applicationId])
      } else {
        toast.error(response.message || 'Gửi báo cáo thất bại')
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setSendingId(null)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <AnalyticsHeader total={candidates.length} />

      <AnalyticsTable
        candidates={candidates}
        isLoading={isLoading}
        onAnalyze={handleAnalyze}
        onEnrich={handleEnrich}
        onSendReport={handleSendReport}
        analyzingId={analyzingId}
        enrichingId={enrichingId}
        sendingId={sendingId}
        analyzedIds={analyzedIds}
        enrichedIds={enrichedIds}
        sentIds={sentIds}
      />
    </motion.div>
  )
}

export default Analytics