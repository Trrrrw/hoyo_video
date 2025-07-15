<script setup>
import { computed, onMounted, ref } from 'vue'
import { getCommentList, submitComment } from '../utils/waline';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';

const route = useRoute()
const path = route.fullPath
const commentList = ref([])
const userInfo = ref({})
const comment = ref('')
const commentCount = computed(() => {
    return commentList.value.length
})
const commentSubmitting = ref(false)
onMounted(async () => {
    commentList.value = await getCommentList(path, 1, 10, 'insertedAt_desc')
    userInfo.value = JSON.parse(localStorage.getItem("userInfo") || '{"nick":"","mail":"","link":""}')
})
const userInfoChange = () => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo.value))
}
const handleSubmit = async () => {
    if (!comment.value) {
        return
    }
    const ua = navigator.userAgent
    commentSubmitting.value = true
    const newCommentReData = await submitComment(
        comment.value,
        userInfo.value.link,
        userInfo.value.mail,
        userInfo.value.nick,
        undefined,
        undefined,
        ua,
        path,
        undefined
    )
    if (newCommentReData.errno !== 0) {
        message.error("评论失败")
        commentSubmitting.value = false
        return
    }
    const newComment = newCommentReData.data
    commentList.value.unshift(newComment)
    commentSubmitting.value = false
    comment.value = ''
}
</script>

<template>
    <a-card class="comment-card">
        <a-flex vertical>
            <a-row :wrap="true" gutter="5" class="user-info-input">
                <a-col :span="8">
                    <a-input v-model:value="userInfo.nick" placeholder="昵称" @change="userInfoChange" />
                </a-col>
                <a-col :span="8">
                    <a-input v-model:value="userInfo.mail" placeholder="邮箱 (可选)" @change="userInfoChange" />
                </a-col>
                <a-col :span="8">
                    <a-input v-model:value="userInfo.link" placeholder="网址 (可选)" @change="userInfoChange" />
                </a-col>
            </a-row>
            <a-comment class="comment-editor">
                <template #content>
                    <a-form-item>
                        <a-textarea v-model:value="comment" :rows="4" />
                    </a-form-item>
                    <a-form-item>
                        <a-button class="submit-btn" html-type="submit" :loading="commentSubmitting" type="primary"
                            @click="handleSubmit">
                            提交
                        </a-button>
                    </a-form-item>
                </template>
            </a-comment>
            <a-list :header="`${commentCount} 评论`" item-layout="horizontal" :data-source="commentList">
                <template #renderItem="{ c }">
                    <a-list-item>
                        <a-comment :author="c.nick" :avatar="c.avatar">
                            <template #content>
                                <p>
                                    {{ c.content }}
                                </p>
                            </template>
                        </a-comment>
                    </a-list-item>
                </template>
            </a-list>
        </a-flex>
    </a-card>
</template>

<style scoped>
.comment-card {
    width: 100%;
    margin-top: 10px;
}

.submit-btn {
    position: absolute;
    top: 0;
    right: 0;
}

:deep(.ant-comment-avatar) {
    display: none;
}
</style>